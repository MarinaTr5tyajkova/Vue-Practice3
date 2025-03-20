Vue.component('kanban-board', {
    template: `
        <div class="kanban-board">
            <kanban-column 
                v-for="(column, index) in columns" 
                :key="index" 
                :title="column.title"
                :cards="column.cards"
                :is-first="index === 0"
                @add-card="openModal"
            ></kanban-column>

            <kanban-modal
                v-if="isModalOpen" 
                :modal-data="modalData" 
                @close="closeModal" 
                @submit="submitModal"
            ></kanban-modal>
        </div>
    `,
    data() {
        return {
            columns: [
                { title: "Запланированные задачи", cards: [] },
                { title: "Задачи в работе", cards: [] },
                { title: "Тестирование", cards: [] },
                { title: "Выполненные задачи", cards: [] }
            ],
            isModalOpen: false,
            modalData: {
                title: '',
                description: '',
                deadline: ''
            }
        };
    },
    methods: {
        addCard(card) {
            this.columns[0].cards.push(card);
        },
        openModal() {
            this.isModalOpen = true;
        },
        closeModal() {
            this.isModalOpen = false;
            this.modalData = { title: '', description: '', deadline: '' }; 
        },
        submitModal() {
            if (this.modalData.title && this.modalData.description && this.modalData.deadline) {
                const card = {
                    ...this.modalData,
                    createdAt: new Date(), // Автоматическая дата создания
                    updatedAt: null,
                    status: null
                };
                this.addCard(card);
                this.closeModal();
            } else {
                alert('Заполните все поля!');
            }
        }
    }
});

Vue.component('kanban-column', {
    props: {
        title: String,
        cards: Array,
        isFirst: Boolean
    },
    template: `
        <div class="column">
            <h2>{{ title }}</h2>
            <span v-if="isFirst" class="add-task" @click="openModal">+ Добавить задачу</span>
            <div class="cards">
                <kanban-card
                    v-for="(card, index) in cards"
                    :key="index"
                    :card="card"
                ></kanban-card>
            </div>
        </div>
    `,
    methods: {
        openModal() {
            this.$emit('add-card');
        }
    }
});

Vue.component('kanban-card', {
    props: {
        card: Object
    },
    template: `
        <div class="card">
            <div class="card-header">
                <h3>{{ card.title }}</h3>
            </div>
            <div class="card-body">
                <p>{{ card.description }}</p>
            </div>
            <div class="dedline">
                <span>{{ formattedDates }}</span>
            </div>
        </div>
    `,
    computed: {
        formattedDates() {
            const createdAt = this.formatDate(this.card.createdAt);
            const deadline = this.formatDate(this.card.deadline);
            return `${createdAt} – ${deadline}`;
        }
    },
    methods: {
        formatDate(date) {
            const d = new Date(date);
            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            return d.toLocaleDateString('ru-RU', options).replace('.', ''); // Убираем точку после месяца
        }
    }
});

Vue.component('kanban-modal', {
    props: {
        modalData: Object
    },
    template: `
        <div class="modal-overlay">
            <div class="modal">
                <h2>Создать карточку</h2>
                <label>
                    Заголовок:
                    <input type="text" v-model="modalData.title" placeholder="Введите заголовок">
                </label>
                <label>
                    Описание:
                    <textarea v-model="modalData.description" placeholder="Введите описание"></textarea>
                </label>
                <label>
                    Дедлайн:
                    <input type="date" v-model="modalData.deadline">
                </label>
                <div class="modal-actions">
                    <button @click="$emit('submit')">Сохранить</button>
                    <button @click="$emit('close')">Отмена</button>
                </div>
            </div>
        </div>
    `
});

let app = new Vue({
    el: '#app'
});