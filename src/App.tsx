import { useState } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { match } from "ts-pattern";

type Task = {
  id: number;
  title: string;
  status: TaskStatus;
};

enum TaskStatus {
  DONE = "done",
  NOT_DONE = "notDone",
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { register, handleSubmit, reset } = useForm<Task>();

  const handleCreateTask = (formValue: Task) => {
    setTasks((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        title: formValue.title,
        status: TaskStatus.NOT_DONE,
      },
    ]);

    reset();
  };

  const handleToggleTask = (taskIndex: number) => {
    setTasks((prev) =>
      prev.map((task, index) => {
        if (index === taskIndex) {
          return {
            ...task,
            status: match(task.status)
              .with(TaskStatus.DONE, () => TaskStatus.NOT_DONE)
              .with(TaskStatus.NOT_DONE, () => TaskStatus.DONE)
              .exhaustive(),
          };
        } else {
          return task;
        }
      })
    );
  };

  return (
    <main className="container mx-auto space-y-16 py-20 px-8">
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
        <ul className="space-y-4">
          {tasks.map((v, taskIndex) => (
            <li
              className={clsx(
                "transition-all border rounded px-4 py-2 flex gap-2 items-center",
                {
                  "opacity-40": v.status === TaskStatus.DONE,
                }
              )}
              key={v.id}
            >
              <button
                className={clsx("border w-4 h-4 rounded-full", {
                  "bg-white": v.status === TaskStatus.DONE,
                })}
                onClick={() => handleToggleTask(taskIndex)}
              />
              <span
                className={clsx({
                  "line-through": v.status === TaskStatus.DONE,
                })}
              >
                {v.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
