import * as fs from 'fs';
import * as path from 'path';

const API_URL = 'http://localhost:3001/api/tasks';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  data: Task[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface Counters {
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  total: number;
}

// Вспомогательные функции для логирования
function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`🧪 ${title}`);
  console.log('='.repeat(60));
}

function logSuccess(message: string) {
  console.log(`✅ ${message}`);
}

function logError(message: string, error?: unknown) {
  console.log(`❌ ${message}`);
  if (error) {
    console.error(error);
  }
}

function logInfo(message: string, data?: unknown) {
  console.log(`ℹ️  ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Тест 1: Получение списка тасок
async function testGetTasks() {
  logSection('ТЕСТ 1: Получение списка тасок');

  try {
    // Тест 1.1: Получение первой страницы (по умолчанию)
    console.log('\n📄 Тест 1.1: Получение первой страницы (лимит 10)');
    const response1 = await fetch(`${API_URL}?page=1&limit=10`);

    if (!response1.ok) {
      logError(`Ошибка: ${response1.status} ${response1.statusText}`);
      return false;
    }

    const result1 = (await response1.json()) as PaginatedResponse;
    logSuccess(`Получено ${result1.data.length} тасок из ${result1.meta.total}`);
    logInfo('Мета-информация', result1.meta);
    logInfo('Первая таска', result1.data[0]);

    // Тест 1.2: Получение с фильтром по статусу
    console.log('\n📄 Тест 1.2: Фильтрация по статусу "completed"');
    const response2 = await fetch(`${API_URL}?status=completed&limit=5`);

    if (!response2.ok) {
      logError(`Ошибка: ${response2.status} ${response2.statusText}`);
      return false;
    }

    const result2 = (await response2.json()) as PaginatedResponse;
    logSuccess(`Найдено ${result2.meta.total} завершённых тасок`);
    logInfo('Примеры completed тасок', result2.data.slice(0, 3));

    // Тест 1.3: Получение второй страницы
    console.log('\n📄 Тест 1.3: Получение второй страницы (лимит 20)');
    const response3 = await fetch(`${API_URL}?page=2&limit=20`);

    if (!response3.ok) {
      logError(`Ошибка: ${response3.status} ${response3.statusText}`);
      return false;
    }

    const result3 = (await response3.json()) as PaginatedResponse;
    logSuccess(`Получена страница ${result3.meta.page} из ${result3.meta.totalPages}`);
    logInfo('Количество тасок на странице', result3.data.length);

    return true;
  } catch (error) {
    logError('Ошибка при получении списка тасок', error);
    return false;
  }
}

// Тест 2: Получение счётчиков
async function testGetCounters() {
  logSection('ТЕСТ 2: Получение счётчиков по статусам');

  try {
    const response = await fetch(`${API_URL}/counters`);

    if (!response.ok) {
      logError(`Ошибка: ${response.status} ${response.statusText}`);
      return false;
    }

    const counters = (await response.json()) as Counters;
    logSuccess('Счётчики успешно получены');

    console.log('\n📊 Статистика по статусам:');
    console.log(`   ⏳ Pending:     ${counters.pending}`);
    console.log(`   🔄 In Progress: ${counters.in_progress}`);
    console.log(`   ✅ Completed:   ${counters.completed}`);
    console.log(`   ❌ Cancelled:   ${counters.cancelled}`);
    console.log(`   📝 Всего:       ${counters.total}`);

    // Проверка корректности
    const sum = counters.pending + counters.in_progress + counters.completed + counters.cancelled;
    if (sum === counters.total) {
      logSuccess('Сумма счётчиков соответствует общему количеству');
    } else {
      logError(`Несоответствие: сумма = ${sum}, total = ${counters.total}`);
    }

    return true;
  } catch (error) {
    logError('Ошибка при получении счётчиков', error);
    return false;
  }
}

// Тест 3: Получение таски по ID
async function testGetTaskById(): Promise<string | null> {
  logSection('ТЕСТ 3: Получение таски по ID');

  try {
    // Сначала получаем список, чтобы взять реальный ID
    console.log('\n🔍 Получаем список тасок для выбора ID...');
    const listResponse = await fetch(`${API_URL}?limit=1`);

    if (!listResponse.ok) {
      logError('Не удалось получить список тасок');
      return null;
    }

    const list = (await listResponse.json()) as PaginatedResponse;
    if (list.data.length === 0) {
      logError('В базе нет тасок');
      return null;
    }

    const taskId = list.data[0].id;
    console.log(`\n📌 Тестируем с ID: ${taskId}`);

    // Получаем таску по ID
    const response = await fetch(`${API_URL}/${taskId}`);

    if (!response.ok) {
      logError(`Ошибка: ${response.status} ${response.statusText}`);
      return null;
    }

    const task = (await response.json()) as Task;
    logSuccess('Таска успешно получена');
    logInfo('Данные таски', task);

    return taskId;
  } catch (error) {
    logError('Ошибка при получении таски по ID', error);
    return null;
  }
}

// Тест 4: Обновление существующей таски
async function testUpdateTask(taskId: string) {
  logSection('ТЕСТ 4: Обновление существующей таски');

  try {
    // Сначала получаем текущее состояние
    console.log(`\n📝 Обновляем таску ${taskId}`);
    const getResponse = await fetch(`${API_URL}/${taskId}`);

    if (!getResponse.ok) {
      logError('Не удалось получить таску для обновления');
      return false;
    }

    const originalTask = (await getResponse.json()) as Task;
    logInfo('Текущее состояние таски', {
      title: originalTask.title,
      status: originalTask.status,
      description: originalTask.description,
    });

    // Обновляем таску
    const updateData = {
      title: `${originalTask.title} (UPDATED)`,
      description: `${originalTask.description || ''} - Updated at ${new Date().toLocaleString()}`,
      status: originalTask.status === 'pending' ? 'in_progress' : originalTask.status,
    };

    console.log('\n🔄 Отправляем обновление...');
    const updateResponse = await fetch(`${API_URL}/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      logError(`Ошибка: ${updateResponse.status} ${updateResponse.statusText}`, errorText);
      return false;
    }

    const updatedTask = (await updateResponse.json()) as Task;
    logSuccess('Таска успешно обновлена');
    logInfo('Новое состояние таски', {
      title: updatedTask.title,
      status: updatedTask.status,
      description: updatedTask.description,
      updatedAt: updatedTask.updatedAt,
    });

    // Проверяем, что изменения применились
    if (updatedTask.title === updateData.title) {
      logSuccess('Заголовок успешно обновлён');
    } else {
      logError('Заголовок не обновился');
    }

    return true;
  } catch (error) {
    logError('Ошибка при обновлении таски', error);
    return false;
  }
}

// Тест 5: Создание новой таски
async function testCreateTask() {
  logSection('ТЕСТ 5: Создание новой таски');

  try {
    const newTask = {
      title: `Test Task - Created at ${new Date().toLocaleString()}`,
      description: 'This is a test task created by automated test script',
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 дней
    };

    console.log('\n➕ Создаём новую таску...');
    logInfo('Данные для создания', newTask);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logError(`Ошибка: ${response.status} ${response.statusText}`, errorText);
      return null;
    }

    const createdTask = (await response.json()) as Task;
    logSuccess('Таска успешно создана!');
    logInfo('Созданная таска', createdTask);

    // Проверяем, что все поля на месте
    console.log('\n🔍 Проверка созданной таски:');
    if (createdTask.id) logSuccess(`ID присвоен: ${createdTask.id}`);
    if (createdTask.title === newTask.title) logSuccess('Заголовок соответствует');
    if (createdTask.description === newTask.description) logSuccess('Описание соответствует');
    if (createdTask.status === newTask.status) logSuccess('Статус соответствует');
    if (createdTask.createdAt) logSuccess('Дата создания установлена');
    if (createdTask.updatedAt) logSuccess('Дата обновления установлена');

    return createdTask.id;
  } catch (error) {
    logError('Ошибка при создании таски', error);
    return null;
  }
}

// Тест 6: Удаление таски (бонусный тест)
async function testDeleteTask(taskId: string) {
  logSection('ТЕСТ 6: Удаление таски (BONUS)');

  try {
    console.log(`\n🗑️  Удаляем таску ${taskId}`);

    const response = await fetch(`${API_URL}/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      logError(`Ошибка: ${response.status} ${response.statusText}`, errorText);
      return false;
    }

    logSuccess('Таска успешно удалена');

    // Проверяем, что таска действительно удалена
    console.log('\n🔍 Проверяем, что таска удалена...');
    const checkResponse = await fetch(`${API_URL}/${taskId}`);

    if (checkResponse.status === 404) {
      logSuccess('Подтверждено: таска не найдена (404)');
      return true;
    } else {
      logError(`Неожиданный статус: ${checkResponse.status}`);
      return false;
    }
  } catch (error) {
    logError('Ошибка при удалении таски', error);
    return false;
  }
}

// Главная функция запуска всех тестов
async function runAllTests() {
  console.log('🚀 ЗАПУСК АВТОМАТИЗИРОВАННЫХ ТЕСТОВ API');
  console.log('📅 Дата: ' + new Date().toLocaleString());
  console.log('🌐 API URL: ' + API_URL);

  const results: { [key: string]: boolean } = {};
  let newTaskId: string | null = null;
  let existingTaskId: string | null = null;

  // Проверка доступности API
  logSection('Проверка доступности API');
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      logSuccess('API доступен и отвечает');
    } else {
      logError('API вернул ошибку');
      process.exit(1);
    }
  } catch (error) {
    logError('API недоступен. Убедитесь, что backend запущен.', error);
    process.exit(1);
  }

  // Запуск тестов
  results['Тест 1: Получение списка'] = await testGetTasks();
  results['Тест 2: Получение счётчиков'] = await testGetCounters();

  existingTaskId = await testGetTaskById();
  results['Тест 3: Получение по ID'] = existingTaskId !== null;

  if (existingTaskId) {
    results['Тест 4: Обновление таски'] = await testUpdateTask(existingTaskId);
  } else {
    results['Тест 4: Обновление таски'] = false;
    logError('Пропущен из-за отсутствия ID');
  }

  newTaskId = await testCreateTask();
  results['Тест 5: Создание таски'] = newTaskId !== null;

  if (newTaskId) {
    results['Тест 6: Удаление таски'] = await testDeleteTask(newTaskId);
  } else {
    results['Тест 6: Удаление таски'] = false;
    logError('Пропущен из-за ошибки создания');
  }

  // Итоговый отчёт
  logSection('ИТОГОВЫЙ ОТЧЁТ');

  let passedCount = 0;
  let failedCount = 0;

  console.log();
  Object.entries(results).forEach(([testName, passed]) => {
    if (passed) {
      console.log(`✅ ${testName}`);
      passedCount++;
    } else {
      console.log(`❌ ${testName}`);
      failedCount++;
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 СТАТИСТИКА:');
  console.log(`   ✅ Пройдено: ${passedCount}`);
  console.log(`   ❌ Провалено: ${failedCount}`);
  console.log(`   📝 Всего: ${passedCount + failedCount}`);
  console.log(`   📈 Успешность: ${((passedCount / (passedCount + failedCount)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  if (failedCount === 0) {
    console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО! 🎉\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  НЕКОТОРЫЕ ТЕСТЫ ПРОВАЛИЛИСЬ ⚠️\n');
    process.exit(1);
  }
}

// Запуск
runAllTests();
