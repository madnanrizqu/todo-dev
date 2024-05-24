import { useState } from "react";
import { useForm } from "react-hook-form";

type Task = {
  id: number;
  title: string;
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { register, handleSubmit, reset } = useForm<Task>();

  const handleCreateTask = (formValue: Task) => {
    setTasks((prev) => [
      ...prev,
      { id: prev.length + 1, title: formValue.title },
    ]);

    reset();
  };

  return (
    <main className="container mx-auto space-y-8 py-8 px-2">
      <header>
        <h1 className="text-5xl text-center">Todo.dev</h1>
      </header>

      <form
        onSubmit={handleSubmit(handleCreateTask)}
        className="flex flex-col items-center"
      >
        <div className="space-y-2">
          <label hidden htmlFor="taskTitle">
            Title
          </label>
          <input
            className="input input-bordered w-full"
            id="taskTitle"
            {...register("title", { required: true })}
          ></input>
          <button type="submit" className="btn w-full">
            Create Task
          </button>
        </div>
      </form>

      {tasks.length > 0 && (
        <ul>
          {tasks.map((v) => (
            <li key={v.id}>{v.title}</li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
