import * as fs from 'fs';
import * as path from 'path';

interface Task {
  title: string;
  description: string;
  status: string;
  dueDate: string;
}

const API_URL = 'http://localhost:3001/api/tasks';
const TASKS_FILE = path.join(__dirname, 'generated-tasks.json');

async function loadTasks(): Promise<Task[]> {
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Ошибка при чтении файла с тасками:', error);
    process.exit(1);
  }
}

async function createTask(task: Task, index: number): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Ошибка при создании таски #${index + 1}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return false;
    }

    const createdTask = (await response.json()) as { id: string };
    console.log(`✅ Таска #${index + 1} создана:`, {
      id: createdTask.id,
      title: task.title,
      status: task.status,
    });
    return true;
  } catch (error) {
    console.error(`❌ Ошибка сети при создании таски #${index + 1}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Начинаем заполнение базы данных...\n');

  // Проверка доступности API
  try {
    console.log('🔍 Проверка доступности API...');
    const response = await fetch(API_URL);
    if (!response.ok) {
      console.error('❌ API недоступен. Убедитесь, что backend запущен.');
      process.exit(1);
    }
    console.log('✅ API доступен\n');
  } catch (error) {
    console.error('❌ Не удалось подключиться к API:', error);
    console.log('💡 Убедитесь, что backend запущен: npm run dev:backend');
    process.exit(1);
  }

  // Загрузка тасок
  const tasks = await loadTasks();
  console.log(`📋 Загружено ${tasks.length} тасок из файла\n`);

  // Создание тасок
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const success = await createTask(task, i);

    if (success) {
      successCount++;
    } else {
      failCount++;
      console.log('\n⚠️  Прерываем выполнение из-за ошибки');
      break;
    }

    // Небольшая задержка между запросами
    if (i < tasks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Итоговая статистика
  console.log('\n' + '='.repeat(50));
  console.log('📊 ИТОГИ:');
  console.log(`✅ Успешно создано: ${successCount}`);
  console.log(`❌ Ошибок: ${failCount}`);
  console.log(`📝 Всего тасок: ${tasks.length}`);
  console.log('='.repeat(50));

  if (failCount > 0) {
    process.exit(1);
  }
}

main();
