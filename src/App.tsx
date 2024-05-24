import { useState } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { match } from "ts-pattern";
import { RxPencil2 } from "react-icons/rx";

type Task = {
  id: number;
  title: string;
  status: TaskStatus;
};

enum TaskStatus {
  DONE = "done",
  NOT_DONE = "notDone",
  IN_EDIT = "inEdit",
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
              .run(),
          };
        } else {
          return task;
        }
      })
    );
  };

  const triggerEditTask = (taskIndex: number) => {
    setTasks((prev) =>
      prev.map((task, index) => {
        if (index === taskIndex) {
          return {
            ...task,
            status: TaskStatus.IN_EDIT,
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
          {tasks.map((task, taskIndex) => (
            <li
              className={clsx(
                "group transition-all border rounded px-4 py-2 h-[49px] flex gap-2 items-center",
                {
                  "opacity-40": task.status === TaskStatus.DONE,
                }
              )}
              key={task.id}
            >
              <button
                className={clsx("border w-4 h-4 rounded-full", {
                  "bg-white": task.status === TaskStatus.DONE,
                })}
                onClick={() => handleToggleTask(taskIndex)}
              />

              {task.status === TaskStatus.IN_EDIT ? (
                <form>
                  <label hidden htmlFor="editTaskTitle">
                    Title
                  </label>
                  <input
                    className="input input-sm input-bordered border w-full"
                    id="editTaskTitle"
                    defaultValue={task.title}
                  />
                </form>
              ) : (
                <span
                  className={clsx({
                    "line-through": task.status === TaskStatus.DONE,
                  })}
                >
                  {task.title}
                </span>
              )}

              <div
                className={clsx(
                  "ml-auto flex items-center opacity-0 group-hover:opacity-100",
                  { "opacity-100": task.status === TaskStatus.IN_EDIT }
                )}
              >
                <button onClick={() => triggerEditTask(taskIndex)}>
                  <RxPencil2 />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
