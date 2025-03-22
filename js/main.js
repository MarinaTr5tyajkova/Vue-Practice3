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
                @move-card-right="moveCardRight"
                @move-card-left="moveCardLeft"
            ></kanban-column>
            <kanban-modal
                v-if="isModalOpen" 
                :modal-data="modalData" 
                :is-editing="!!editingCard" 
                @close="closeModal" 
                @submit="submitModal"
            ></kanban-modal>
            <return-reason-modal
                v-if="isReturnModalOpen"
                :value="modalData.reason" 
                @input="modalData.reason = $event"
                @close="closeReturnModal"
                @submit="submitReturn"
            ></return-reason-modal>
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
                deadline: '',
                priority: '1', 
                reason: ''
            },
            editingCard: null,
            isReturnModalOpen: false,
            cardToReturn: null
        };
    },
    methods: {
        addCard(card) {
            this.columns[0].cards.push(card);
            this.sortAllColumnsByPriority(); 
        },
        openModal() {
            this.modalData = {
                title: '',
                description: '',
                deadline: '',
                priority: '1', 
                reason: ''
            };
            this.editingCard = null;
            this.isModalOpen = true;
        },
        closeModal() {
            this.isModalOpen = false;
            this.modalData = {
                title: '',
                description: '',
                deadline: '',
                priority: '1', 
                reason: ''
            };
        },
        submitModal() {
            if (!this.modalData.title.trim() || !this.modalData.description.trim() || !this.modalData.deadline) {
                alert('Все поля должны быть заполнены!');
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
                const updatedCard = Object.assign({}, this.editingCard, {
                    title: this.modalData.title,
                    description: this.modalData.description,
                    deadline: this.modalData.deadline,
                    priority: this.modalData.priority,
                    updatedAt: new Date()
                });
                Vue.set(this.columns[columnIndex].cards, cardIndex, updatedCard);
                this.sortAllColumnsByPriority(); 
                this.editingCard = null;
            } else {
                const card = {
                    title: this.modalData.title,
                    description: this.modalData.description,
                    deadline: this.modalData.deadline,
                    priority: this.modalData.priority,
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
            this.sortAllColumnsByPriority(); 
        },
        editCard(card) {
            this.modalData = {
                title: card.title,
                description: card.description,
                deadline: card.deadline,
                priority: card.priority, 
                reason: ''
            };
            this.editingCard = card;
            this.isModalOpen = true;
        },
        moveCardRight(card) {
            const fromColumnIndex = this.columns.findIndex(column => column.cards.includes(card));
            const toColumnIndex = fromColumnIndex + 1;
            if (toColumnIndex === 3) { 
                const today = new Date();
                const deadline = new Date(card.deadline);
                if (today > deadline) {
                    card.status = 'Просрочена'; 
                } else {
                    card.status = 'Выполнено в срок'; 
                }
            }
            if (toColumnIndex >= this.columns.length) {
                alert('Нельзя переместить карточку дальше!');
                return;
            }
            const fromColumn = this.columns[fromColumnIndex];
            const toColumn = this.columns[toColumnIndex];
            const cardIndex = fromColumn.cards.indexOf(card);
            fromColumn.cards.splice(cardIndex, 1);
            toColumn.cards.push(card);
            this.sortAllColumnsByPriority();
        },
        moveCardLeft(card) {
            const fromColumnIndex = this.columns.findIndex(column => column.cards.includes(card));
            if (fromColumnIndex === 2) { 
                this.openReturnModal(card); 
            } else {
                const toColumnIndex = fromColumnIndex - 1;
                if (toColumnIndex < 0) {
                    alert('Нельзя переместить карточку назад!');
                    return;
                }
                const fromColumn = this.columns[fromColumnIndex];
                const toColumn = this.columns[toColumnIndex];
                const cardIndex = fromColumn.cards.indexOf(card);
                fromColumn.cards.splice(cardIndex, 1); 
                toColumn.cards.unshift(card); 
            }
            this.sortAllColumnsByPriority(); 
        },
        sortAllColumnsByPriority() {
            this.columns.forEach((column, index) => {
                this.sortCardsByPriority(index);
            });
        },
        sortCardsByPriority(columnIndex) {
            this.columns[columnIndex].cards.sort((a, b) => a.priority - b.priority);
        },
        openReturnModal(card) {
            this.cardToReturn = card;
            this.modalData.reason = '';
            this.isReturnModalOpen = true;
        },
        closeReturnModal() {
            this.isReturnModalOpen = false;
            this.modalData.reason = '';
        },
        submitReturn() {
            if (!this.modalData.reason.trim()) {
                alert('Укажите причину возврата!');
                return;
            }

            const fromColumnIndex = this.columns.findIndex(column => 
                column.cards.includes(this.cardToReturn)
            );
            
            if (fromColumnIndex === 2) {
                const cardIndex = this.columns[fromColumnIndex].cards.indexOf(this.cardToReturn);
                
                const updatedCard = { 
                    ...this.cardToReturn, 
                    reason: this.modalData.reason 
                };
                
                this.columns[fromColumnIndex].cards.splice(cardIndex, 1);
                this.columns[1].cards.unshift(updatedCard);
                this.sortAllColumnsByPriority();
            }

            this.closeReturnModal();
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
                    :show-left-arrow="!isFirst && title === 'Тестирование'"
                    @delete="$emit('delete-card', card)"
                    @edit="$emit('edit-card', card)"
                    @move-right="$emit('move-card-right', card)"
                    @move-left="$emit('move-card-left', card)"
                ></kanban-card>
            </div>
        </div>
    `
});

Vue.component('kanban-card', {
    props: {
        card: Object,
        showLeftArrow: Boolean
    },
    template: `
        <div :class="['card', 'priority-' + card.priority]">
            <div class="card-header">
                <span class="sticker">{{ formattedDates }}</span>
            </div>
            <div><h3>{{ card.title }}</h3></div>
            <div class="card-body">
                <p>{{ card.description }}</p>
                <p v-if="card.status"><strong>Статус:</strong> {{ card.status }}</p>
                <p v-if="card.reason"><strong>Причина возврата:</strong> {{ card.reason }}</p>
            </div>
            <div class="card-actions" v-if="!isInDoneColumn">
                <button @click="$emit('edit')">Редактировать</button>
                <button @click="$emit('delete')">Удалить</button>
                <a v-if="showLeftArrow" @click="$emit('move-left')" class="move-icon">
                    <img src="./img/left_arrow.svg" alt="Переместить влево">
                </a>
                <a @click="$emit('move-right')" class="move-icon">
                    <img src="./img/right_arrow.svg" alt="Переместить вправо">
                </a>
            </div>
            <div><p v-if="card.updatedAt" class="last_change"><strong>Последнее изменение:</strong><br>{{ formatDate(card.updatedAt, true) }}</p></div>
        </div>
    `,
    computed: {
        formattedDates() {
            const createdAt = this.formatDate(this.card.createdAt); 
            const deadline = this.formatDate(this.card.deadline); 
            return `${createdAt} – ${deadline}`;
        },
        isInDoneColumn() {
            return this.$parent.$parent.columns[3].cards.includes(this.card);
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
        <h2>{{ isEditing ? 'Редактировать карточку' : 'Создать задачу' }}</h2>
        <label>
          Заголовок:
          <input v-model="modalData.title" placeholder="Введите заголовок" required>
        </label>
        <label>
          Описание:
          <textarea v-model="modalData.description" placeholder="Введите описание"></textarea>
        </label>
        <label>
          Дедлайн:
          <input type="date" v-model="modalData.deadline">
        </label>
        <label>
          Приоритет:
          <select v-model="modalData.priority">
            <option value="1">Высший (1)</option>
            <option value="2">Средний (2)</option>
            <option value="3">Низший (3)</option>
          </select>
        </label>
        <div class="modal-actions">
          <button @click="$emit('submit')">Сохранить</button>
          <button @click="$emit('close')">Отмена</button>
        </div>
      </div>
    </div>
  `
});

Vue.component('return-reason-modal', {
    props: ['value'], 
    template: `
      <div class="modal-overlay">
        <div class="modal">
          <h2>Укажите причину возврата</h2>
          <label>
            Причина:
            <textarea 
                v-model="internalReason" 
                placeholder="Введите причину"
                @input="$emit('input', $event.target.value)"></textarea>
          </label>
          <div class="modal-actions">
            <button @click="$emit('submit')">Сохранить</button>
            <button @click="$emit('close')">Отмена</button>
          </div>
        </div>
      </div>
    `,
    data() {
        return {
            internalReason: this.value 
        };
    },
    watch: {
        value(newVal) {
            this.internalReason = newVal;
        }
    }
});

let app = new Vue({
    el: '#app'
});