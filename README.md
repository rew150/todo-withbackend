# todo-withbackend

Simple frontend for the purpose of teaching backend using svelte

## Expectation

You write backend at port 8080.

```typescript
interface TodoEntity {
    id: string;
    creatorName: string;
    text: string;
    todoType: number;
}

interface PostTodo {
    creatorName: string; // required
    text: string; // required
    todoType: number; // required, can be either 1, 2, or 3
}

interface PatchTodo {
    text: string; // required
}
```

- `GET /api/todo?todo_type=1` todo_type can be 1, 2, 3 correspond with work, travel, and shopping respectively, returns `TodoEntity[]`.
- `POST /api/todo` with JSON `PostTodo`, id should be auto-generated at backend side.
- `PATCH /api/todo/{id}` with JSON `PatchTodo`.
- `DELETE /api/todo/{id}`

## Building

```
npm install
npm run prepare
npm run build
```

## Configuration

- .env.example
- nginx.conf.example
