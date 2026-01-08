// 现代化待办清单 - JavaScript逻辑文件

// DOM元素引用
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const inputHint = document.getElementById('inputHint');
const clearAllBtn = document.getElementById('clearAllBtn');
let currentPriority = 'normal'; // 当前选中的优先级

// 任务数组（存储所有任务）
let tasks = [];

// 初始化应用
function initApp() {
    // 加载示例任务（可选）
    loadSampleTasks();

    // 渲染任务列表
    renderTasks();

    // 更新统计
    updateStats();

    // 设置事件监听器
    setupEventListeners();

    // 显示欢迎消息
    showWelcomeMessage();
}

// 加载示例任务（仅用于演示）
function loadSampleTasks() {
    if (tasks.length === 0) {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date(now);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        tasks = [
            {
                id: Date.now(),
                text: '学习JavaScript基础知识',
                completed: false,
                createdAt: twoDaysAgo.toISOString(),
                priority: 'high' // 高优先级
            },
            {
                id: Date.now() + 1,
                text: '完成待办清单项目',
                completed: true,
                createdAt: yesterday.toISOString(),
                priority: 'normal' // 普通优先级
            },
            {
                id: Date.now() + 2,
                text: '阅读技术文档',
                completed: false,
                createdAt: now.toISOString(),
                priority: 'normal' // 普通优先级
            }
        ];
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 添加按钮点击事件
    addBtn.addEventListener('click', addTaskFromInput);

    // 输入框回车键事件
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskFromInput();
        }
    });

    // 输入框获得焦点时更新提示
    taskInput.addEventListener('focus', () => {
        inputHint.textContent = '输入任务内容后按回车或点击添加按钮';
    });

    // 输入框失去焦点时恢复提示
    taskInput.addEventListener('blur', () => {
        inputHint.textContent = '按回车键或点击添加按钮';
    });

    // 使用事件委托处理任务列表中的点击事件
    taskList.addEventListener('click', handleTaskListClick);

    // 优先级按钮点击事件
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有按钮的active类
            document.querySelectorAll('.priority-btn').forEach(b => {
                b.classList.remove('active');
            });
            // 添加active类到当前按钮
            btn.classList.add('active');
            // 更新当前优先级
            currentPriority = btn.dataset.priority;
        });
    });

    // 全部删除按钮点击事件
    clearAllBtn.addEventListener('click', clearAllTasks);
}

// 处理任务列表点击事件
function handleTaskListClick(e) {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;

    const taskId = parseInt(taskItem.dataset.id);

    // 处理删除按钮点击
    if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
        deleteTask(taskId);
        return;
    }

    // 处理复选框点击
    if (e.target.type === 'checkbox' || e.target.closest('.task-checkbox')) {
        toggleTask(taskId);
        return;
    }

    // 处理任务文本双击（编辑功能）
    if (e.target.classList.contains('task-text') && e.detail === 2) {
        editTask(taskId, taskItem);
    }
}

// 从输入框添加任务
function addTaskFromInput() {
    const taskText = taskInput.value.trim();

    // 验证输入
    if (!taskText) {
        showError('请输入任务内容');
        return;
    }

    if (taskText.length > 100) {
        showError('任务内容不能超过100个字符');
        return;
    }

    // 创建新任务（使用当前选中的优先级）
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        priority: currentPriority
    };

    // 添加到任务数组
    tasks.push(newTask);

    // 清空输入框
    taskInput.value = '';

    // 重新渲染任务列表
    renderTasks();

    // 更新统计
    updateStats();

    // 显示成功反馈
    showSuccess('任务添加成功！');

    // 聚焦到输入框
    taskInput.focus();
}

// 添加任务（直接调用）
function addTask(text, priority = 'normal') {
    if (!text || text.trim() === '') return;

    const newTask = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        priority: priority
    };

    tasks.push(newTask);
    renderTasks();
    updateStats();
}

// 删除任务
function deleteTask(taskId) {
    // 找到任务索引
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;

    // 获取任务元素
    const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);

    // 添加删除动画
    if (taskElement) {
        taskElement.classList.add('removing');

        // 动画结束后删除
        setTimeout(() => {
            tasks.splice(taskIndex, 1);
            renderTasks();
            updateStats();
            showSuccess('任务已删除');
        }, 300);
    } else {
        tasks.splice(taskIndex, 1);
        renderTasks();
        updateStats();
    }
}

// 切换任务完成状态
function toggleTask(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
        updateStats();

        // 显示状态变更反馈
        const message = task.completed ? '任务标记为已完成' : '任务标记为未完成';
        showSuccess(message);
    }
}

// 编辑任务（双击任务文本）
function editTask(taskId, taskElement) {
    const task = tasks.find(task => task.id === taskId);
    if (!task) return;

    const taskTextElement = taskElement.querySelector('.task-header .task-text');
    const originalText = task.text;

    // 创建编辑输入框
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = originalText;
    editInput.className = 'edit-input';
    editInput.style.cssText = `
        flex: 1;
        padding: 4px 8px;
        border: 2px solid #4a6fa5;
        border-radius: 4px;
        font-size: 1rem;
        outline: none;
    `;

    // 替换文本为输入框
    taskTextElement.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    // 保存编辑
    function saveEdit() {
        const newText = editInput.value.trim();

        if (newText && newText !== originalText) {
            if (newText.length > 100) {
                showError('任务内容不能超过100个字符');
                editInput.focus();
                return;
            }

            task.text = newText;
            renderTasks();
            showSuccess('任务已更新');
        } else if (!newText) {
            showError('任务内容不能为空');
            editInput.focus();
            return;
        }

        // 恢复文本显示
        editInput.replaceWith(taskTextElement);
    }

    // 取消编辑
    function cancelEdit() {
        editInput.replaceWith(taskTextElement);
    }

    // 输入框事件处理
    editInput.addEventListener('blur', saveEdit);
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    });
}

// 渲染任务列表
function renderTasks() {
    // 清空任务列表
    taskList.innerHTML = '';

    // 如果没有任务，显示空状态
    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    // 隐藏空状态
    emptyState.classList.add('hidden');

    // 渲染每个任务
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

// 格式化日期时间
function formatDateTime(isoString) {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 获取优先级标签文本和类名
function getPriorityInfo(priority) {
    switch (priority) {
        case 'high':
            return { text: '重要', className: 'priority-high' };
        case 'normal':
            return { text: '普通', className: 'priority-normal' };
        case 'low':
            return { text: '低', className: 'priority-low' };
        default:
            return { text: '普通', className: 'priority-normal' };
    }
}

// 创建单个任务元素
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task-item ${task.completed ? 'completed' : ''} ${task.priority === 'high' ? 'priority-high-task' : ''}`;
    taskElement.dataset.id = task.id;

    const priorityInfo = getPriorityInfo(task.priority);
    const formattedTime = formatDateTime(task.createdAt);

    taskElement.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <div class="task-content">
            <div class="task-header">
                <span class="task-text">${escapeHtml(task.text)}</span>
                <span class="priority-tag ${priorityInfo.className}">${priorityInfo.text}</span>
            </div>
            <div class="task-meta">
                <span class="created-time">${formattedTime}</span>
            </div>
        </div>
        <button class="delete-btn" aria-label="删除任务">
            <i class="fas fa-trash"></i>
        </button>
    `;

    return taskElement;
}

// 更新统计信息
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;

    // 更新统计值的颜色
    totalTasksEl.style.color = total > 0 ? '#4a6fa5' : '#6c757d';
    completedTasksEl.style.color = completed > 0 ? '#28a745' : '#6c757d';
}

// 显示错误消息
function showError(message) {
    // 添加错误样式到输入框
    taskInput.classList.add('error');
    inputHint.textContent = message;
    inputHint.style.color = '#dc3545';

    // 移除错误样式
    setTimeout(() => {
        taskInput.classList.remove('error');
        inputHint.textContent = '按回车键或点击添加按钮';
        inputHint.style.color = '';
    }, 2000);
}

// 显示成功消息
function showSuccess(message) {
    // 创建反馈元素
    const feedback = document.createElement('div');
    feedback.className = 'success-feedback';
    feedback.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;

    // 添加到页面
    document.body.appendChild(feedback);

    // 3秒后移除
    setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transform = 'translateY(-20px)';
        setTimeout(() => feedback.remove(), 300);
    }, 3000);
}

// 显示欢迎消息
function showWelcomeMessage() {
    if (tasks.length > 0) {
        showSuccess(`欢迎使用待办清单！当前有${tasks.length}个任务`);
    }
}

// HTML转义函数（防止XSS攻击）
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 键盘快捷键支持
document.addEventListener('keydown', (e) => {
    // Ctrl + Enter 添加任务
    if (e.ctrlKey && e.key === 'Enter') {
        addTaskFromInput();
    }

    // Esc 清空输入框
    if (e.key === 'Escape' && document.activeElement === taskInput) {
        taskInput.value = '';
    }

    // Ctrl + D 删除所有已完成任务
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        deleteCompletedTasks();
    }
});

// 删除所有已完成任务
function deleteCompletedTasks() {
    const completedCount = tasks.filter(task => task.completed).length;

    if (completedCount === 0) {
        showError('没有已完成的任务可以删除');
        return;
    }

    if (confirm(`确定要删除${completedCount}个已完成的任务吗？`)) {
        tasks = tasks.filter(task => !task.completed);
        renderTasks();
        updateStats();
        showSuccess(`已删除${completedCount}个已完成的任务`);
    }
}

// 删除所有任务
function clearAllTasks() {
    if (tasks.length === 0) {
        showError('没有任务可以删除');
        return;
    }

    if (confirm(`确定要删除所有${tasks.length}个任务吗？此操作不可撤销！`)) {
        tasks = [];
        renderTasks();
        updateStats();
        showSuccess('已删除所有任务');
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);

// 导出函数供控制台调试使用
window.todoApp = {
    addTask,
    deleteTask,
    toggleTask,
    deleteCompletedTasks,
    getTasks: () => tasks,
    clearAllTasks: () => {
        tasks = [];
        renderTasks();
        updateStats();
        showSuccess('已清空所有任务');
    }
};