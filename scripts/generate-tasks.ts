import * as fs from 'fs';
import * as path from 'path';

// Типы
enum TaskStatus {
  pending = 'pending',
  in_progress = 'in_progress',
  completed = 'completed',
  cancelled = 'cancelled',
}

interface Task {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string;
}

// 10 standard task templates
const TASK_TEMPLATES = [
  {
    title: 'Prepare sales report',
    description: 'Create detailed sales report for current quarter with trend analysis',
  },
  {
    title: 'Conduct team meeting',
    description: 'Weekly meeting to discuss project progress and plan upcoming tasks',
  },
  {
    title: 'Update project documentation',
    description: 'Add new sections and update outdated information in documentation',
  },
  {
    title: 'Check and reply to emails',
    description: 'Process incoming emails and respond to important client requests',
  },
  {
    title: 'Develop new feature',
    description: 'Implement data export functionality in various formats',
  },
  {
    title: 'Conduct code review',
    description: 'Review pull requests and leave comments for code improvements',
  },
  {
    title: 'Optimize performance',
    description: 'Find and fix bottlenecks in the application, improve loading time',
  },
  {
    title: 'Prepare presentation',
    description: 'Create presentation to demonstrate new product to potential clients',
  },
  {
    title: 'Conduct testing',
    description: 'Perform complete testing of new functionality before release',
  },
  {
    title: 'Update project dependencies',
    description: 'Check and update outdated packages, fix potential compatibility issues',
  },
];

const STATUSES: TaskStatus[] = [
  TaskStatus.pending,
  TaskStatus.in_progress,
  TaskStatus.completed,
  TaskStatus.cancelled,
];

/**
 * Генерирует случайную дату между сегодня и концом следующего месяца
 */
function generateRandomDate(): string {
  const today = new Date();
  const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  const startTimestamp = today.getTime();
  const endTimestamp = endOfNextMonth.getTime();

  const randomTimestamp = startTimestamp + Math.random() * (endTimestamp - startTimestamp);
  const randomDate = new Date(randomTimestamp);

  return randomDate.toISOString();
}

/**
 * Генерирует случайный статус
 */
function generateRandomStatus(): TaskStatus {
  return STATUSES[Math.floor(Math.random() * STATUSES.length)];
}

/**
 * Генерирует массив задач
 */
function generateTasks(count: number): Task[] {
  const tasks: Task[] = [];

  for (let i = 0; i < count; i++) {
    const template = TASK_TEMPLATES[i % TASK_TEMPLATES.length];
    const task: Task = {
      title: `${template.title} #${i + 1}`,
      description: template.description,
      status: generateRandomStatus(),
      dueDate: generateRandomDate(),
    };
    tasks.push(task);
  }

  return tasks;
}

/**
 * Сохраняет задачи в JSON файл
 */
function saveTasks(tasks: Task[], filename: string): void {
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), 'utf-8');
  console.log(`✅ Сохранено ${tasks.length} задач в файл: ${filePath}`);
}

/**
 * Отправляет POST запрос для создания задачи
 */
async function createTask(task: Task, apiUrl: string): Promise<any> {
  try {
    const response = await fetch(`${apiUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Ошибка создания задачи "${task.title}":`, error);
    throw error;
  }
}

/**
 * Отправляет задачи на сервер по очереди
 */
async function sendTasksToServer(tasks: Task[], apiUrl: string): Promise<void> {
  console.log(`\n🚀 Начинаем отправку ${tasks.length} задач на ${apiUrl}...`);

  const results = {
    success: 0,
    failed: 0,
  };

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    try {
      process.stdout.write(`\r📤 Отправка задачи ${i + 1}/${tasks.length}...`);
      await createTask(task, apiUrl);
      results.success++;

      // Небольшая задержка между запросами
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      results.failed++;
    }
  }

  console.log(`\n\n✅ Успешно создано: ${results.success}`);
  console.log(`❌ Ошибок: ${results.failed}`);
}

/**
 * Проверяет доступность сервера
 */
async function checkServerHealth(apiUrl: string): Promise<boolean> {
  try {
    console.log(`🔍 Проверка доступности сервера ${apiUrl}...`);
    const response = await fetch(`${apiUrl}/api`);
    if (response.ok) {
      console.log('✅ Сервер доступен');
      return true;
    }
    console.log('⚠️  Сервер недоступен');
    return false;
  } catch (error) {
    console.log('❌ Не удалось подключиться к серверу:', error);
    return false;
  }
}

/**
 * Основная функция
 */
async function main() {
  const TASKS_COUNT = 100;
  const API_URL = process.env.API_URL || 'http://localhost:3000';
  const OUTPUT_FILE = 'generated-tasks.json';

  console.log('🎯 Генератор задач');
  console.log('='.repeat(50));
  console.log(`📊 Количество задач: ${TASKS_COUNT}`);
  console.log(`🌐 API URL: ${API_URL}`);
  console.log(`📁 Файл сохранения: ${OUTPUT_FILE}`);
  console.log('='.repeat(50));

  // 1. Генерируем задачи
  console.log('\n📝 Генерация задач...');
  const tasks = generateTasks(TASKS_COUNT);
  console.log(`✅ Сгенерировано ${tasks.length} задач`);

  // 2. Сохраняем на диск
  saveTasks(tasks, OUTPUT_FILE);

  // 3. Проверяем доступность сервера
  const serverAvailable = await checkServerHealth(API_URL);

  if (!serverAvailable) {
    console.log('\n⚠️  Сервер недоступен. Запустите backend командой: npm run dev:backend');
    console.log('Или используйте переменную окружения API_URL для указания другого адреса.');
    process.exit(1);
  }

  // 4. Отправляем задачи на сервер
  await sendTasksToServer(tasks, API_URL);

  console.log('\n🎉 Готово! Все задачи созданы и сохранены.');
}

// Запуск
main().catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
