Vue.component('kanban-board', {
    template: `
        <div class="kanban-board">
            <kanban-column 
                v-for="(column, index) in columns" 
                :key="index" 
                :title="column.title"
            ></kanban-column>
        </div>
    `,
    data() {
        return {
            columns: [
                { title: "Запланированные задачи" },
                { title: "Задачи в работе" },
                { title: "Тестирование" },
                { title: "Выполненные задачи" }
            ]
        };
    }
});

Vue.component('kanban-column', {
    props: {
        title: String
    },
    template: `
        <div class="column">
            <h2>{{ title }}</h2>
        </div>
    `
});

Vue.component('kanban-card', {

});

Vue.component('kanban-modal', {
   
});

let app = new Vue({
    el: '#app'
});