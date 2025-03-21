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
                @delete-card="deleteCard"
                @edit-card="editCard"
            ></kanban-column>

            <kanban-modal
                v-if="isModalOpen" 
                :modal-data="modalData" 
                :is-editing="!!editingCard" 
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
            },
            editingCard: null
        };
    },
    methods: {
        addCard(card) {
            this.columns[0].cards.push(card);
        },
        openModal() {
            this.modalData = { title: '', description: '', deadline: '' };
            this.editingCard = null; 
            this.isModalOpen = true;
        },
        closeModal() {
            this.isModalOpen = false;
            this.modalData = { title: '', description: '', deadline: '' };
        },
        submitModal() {
            if (!this.modalData.title || !this.modalData.description || !this.modalData.deadline) {
                alert('Заполните все поля!');
                return;
            }

            const deadline = new Date(this.modalData.deadline);
            const today = new Date();
            if (deadline < today) {
                alert('Дедлайн не может быть раньше текущей даты!');
                return;
            }

            if (this.editingCard) {
                const columnIndex = this.columns.findIndex(column => column.cards.includes(this.editingCard));
                const cardIndex = this.columns[columnIndex].cards.indexOf(this.editingCard);

                Vue.set(this.columns[columnIndex].cards, cardIndex, {
                    ...this.editingCard,
                    title: this.modalData.title,
                    description: this.modalData.description,
                    deadline: this.modalData.deadline,
                    updatedAt: new Date()
                });
                this.editingCard = null;
            } else {
                const card = {
                    title: this.modalData.title,
                    description: this.modalData.description,
                    deadline: this.modalData.deadline,
                    createdAt: new Date(),
                    updatedAt: null,
                    status: null
                };
                this.addCard(card);
            }

            this.closeModal();
        },
        deleteCard(card) {
            const columnIndex = this.columns.findIndex(column => column.cards.includes(card));
            const cardIndex = this.columns[columnIndex].cards.indexOf(card);
            this.columns[columnIndex].cards.splice(cardIndex, 1);
        },
        editCard(card) {
            this.modalData = {
                title: card.title,
                description: card.description,
                deadline: card.deadline
            };
            this.editingCard = card; 
            this.isModalOpen = true;
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
            <span v-if="isFirst" class="add-task" @click="$emit('add-card')">+ Добавить задачу</span>
            <div class="cards">
                <kanban-card
                    v-for="(card, index) in cards"
                    :key="index"
                    :card="card"
                    @delete="$emit('delete-card', card)"
                    @edit="$emit('edit-card', card)"
                ></kanban-card>
            </div>
        </div>
    `,
    methods: {
        openModal() {
            this.$emit('add-card');
        },
        onDelete(index) {
            this.$emit('delete-card', this.columnIndex, index);
        },
        onEdit(index) {
            this.$emit('edit-card', this.columnIndex, index);
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
                <span class="sticker">{{ formattedDates }}</span>
            </div>
            <div class="card-body">
                <p><strong>Описание:</strong> {{ card.description }}</p>
                <p v-if="card.updatedAt"><strong>Последнее изменение:</strong> {{ formatDate(card.updatedAt, true) }}</p>
            </div>
            <div class="card-actions">
                <button @click="$emit('edit')">Редактировать</button>
                <button @click="$emit('delete')">Удалить</button>
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
        formatDate(date, includeTime = false) {
            const d = new Date(date);
            const options = { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            };
            if (includeTime) {
                options.hour = '2-digit';
                options.minute = '2-digit';
            }
            return d.toLocaleDateString('ru-RU', options).replace('.', '');
        }
    }
});

Vue.component('kanban-modal', {
    props: {
        modalData: Object,
        isEditing: Boolean 
    },
    template: `
        <div class="modal-overlay">
            <div class="modal">
                <h2>{{ isEditing ? 'Редактировать карточку' : 'Создать карточку' }}</h2>
                <label>
                    Заголовок:
                    <input type="text" v-model="modalData.title" placeholder="Введите заголовок" class="modal-input">
                </label>
                <label>
                    Описание:
                    <textarea v-model="modalData.description" placeholder="Введите описание" class="modal-textarea"></textarea>
                </label>
                <label>
                    Дедлайн:
                    <input type="date" v-model="modalData.deadline" :min="minDate" class="modal-input">
                </label>
                <div class="modal-actions">
                    <button @click="$emit('submit')" class="modal-button">Сохранить</button>
                    <button @click="$emit('close')" class="modal-button">Отмена</button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            minDate: this.getTodayDate()
        };
    },
    methods: {
        getTodayDate() {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    }
});

let app = new Vue({
    el: '#app'
});