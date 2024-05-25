import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { P, match } from "ts-pattern";
import { RxMagnifyingGlass, RxPencil2 } from "react-icons/rx";
import { RxCheck } from "react-icons/rx";
import { RxCross2 } from "react-icons/rx";
import { RxTrash } from "react-icons/rx";
import { useIsFirstRender } from "./hooks/render";
import { useLocalStorageState } from "./hooks/storage";

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
  const [tasks, setTasks] = useLocalStorageState<Task[]>("app.tasks", []);

  const isFirstRender = useIsFirstRender();

  const [activeSearchQuery, setActiveSearchQuery] = useState<string | null>(
    null
  );

  const formCreate = useForm<{ newTitle: string }>();
  const formUpdate = useForm<{ updatedTitle: string }>();
  const formSearch = useForm<{ searchQuery: string }>();

  const handleCreateTask = (formValue: Task["title"]) => {
    setTasks((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        title: formValue,
        status: TaskStatus.NOT_DONE,
      },
    ]);

    formCreate.reset();
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

  const toggleTriggerUpdateTask = (taskIndex: number) => {
    setTasks((prev) =>
      prev.map((task, index) => {
        if (index === taskIndex) {
          return {
            ...task,
            status: match(task.status)
              .with(TaskStatus.IN_EDIT, () => TaskStatus.NOT_DONE)
              .otherwise(() => TaskStatus.IN_EDIT),
          };
        } else {
          return task;
        }
      })
    );
  };

  const handleUpdateTask = (updatedTitle: string, taskIndex: number) => {
    setTasks((prev) =>
      prev.map((task, index) => {
        if (index === taskIndex) {
          return {
            ...task,
            title: updatedTitle,
            status: TaskStatus.NOT_DONE,
          };
        } else {
          return task;
        }
      })
    );
  };

  const handleDeleteTask = (taskIndex: number) => {
    setTasks((prev) => prev.filter((_, index) => taskIndex !== index));
  };

  const handleSearchTask = (searchQuery: string) => {
    setActiveSearchQuery(searchQuery.toLowerCase());
  };

  const handleResetSearch = () => {
    setActiveSearchQuery(null);
  };

  useEffect(() => {
    // to sync state with query params

    const queryParams = new URLSearchParams(window.location.search);
    const queryParamsSearch = queryParams.get("search");
    const queryParamsPrefix = "?";

    match([queryParamsSearch, activeSearchQuery])
      .with([P._, P.string], () => {
        queryParams.set("search", activeSearchQuery as string);
        history.pushState(null, "", queryParamsPrefix + queryParams.toString());
      })
      .with([P.string, P.nullish], () => {
        if (isFirstRender) {
          setActiveSearchQuery(queryParams.get("search"));
        } else {
          history.pushState(null, "", "?search=");
        }
      })
      .with([P.nullish, P.nullish], () => {
        history.pushState(null, "", "?search=");
      })
      .exhaustive();
  }, [activeSearchQuery]);

  const displayedTasks = activeSearchQuery
    ? tasks.filter(
        (task) => task.title.toLowerCase().search(activeSearchQuery) > -1
      )
    : tasks;

  return (
    <main className="container mx-auto space-y-16 py-20 px-8">
      <header>
        <h1 className="text-5xl text-center">Todo.dev</h1>
      </header>

      <form
        onSubmit={formCreate.handleSubmit((v) => handleCreateTask(v.newTitle))}
        className="flex flex-col items-center"
      >
        <label
          htmlFor="newTitle"
          className="group input input-bordered flex items-center gap-2 transition-all hover:border-primary focus-within:border-primary"
        >
          <input
            id="newTitle"
            {...formCreate.register("newTitle", { required: true })}
            type="text"
            className="grow"
            placeholder="Create New Task"
          />
          <button
            className="opacity-0 group-focus-within:opacity-100 hover:text-primary"
            type="submit"
          >
            <RxCheck />
          </button>
        </label>
      </form>

      {displayedTasks.length > 0 && (
        <div className="space-y-4">
          <form
            onReset={handleResetSearch}
            onSubmit={formSearch.handleSubmit((v) =>
              handleSearchTask(v.searchQuery)
            )}
          >
            <label
              htmlFor="newTitle"
              className="group input input-bordered flex items-center gap-2 transition-all hover:border-primary focus-within:border-primary"
            >
              <input
                id="searchTitle"
                type="text"
                className="grow"
                placeholder="Search Task"
                defaultValue={activeSearchQuery ?? ""}
                {...formSearch.register("searchQuery")}
              />
              {activeSearchQuery && (
                <button
                  className={clsx("opacity-0 hover:text-primary", {
                    "group-focus-within:opacity-100": activeSearchQuery,
                  })}
                  type="reset"
                >
                  <RxCross2 />
                </button>
              )}
              <button
                className="opacity-0 group-focus-within:opacity-100 hover:text-primary"
                type="submit"
              >
                <RxMagnifyingGlass />
              </button>
            </label>
          </form>

          <div className="divider"></div>

          <ul className="space-y-4">
            {displayedTasks.map((task, taskIndex) => (
              <li
                className={clsx(
                  "group transition-all border border-neutral rounded px-4 py-2 h-[49px] flex gap-2 items-center",
                  {
                    "hover:border-primary": task.status === TaskStatus.NOT_DONE,
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
                  <form
                    onSubmit={formUpdate.handleSubmit((v) =>
                      handleUpdateTask(v.updatedTitle, taskIndex)
                    )}
                    className="flex gap-2"
                  >
                    <label hidden htmlFor="editTaskTitle">
                      Title
                    </label>
                    <input
                      className="input input-sm input-bordered border w-full"
                      id="editTaskTitle"
                      defaultValue={task.title}
                      {...formUpdate.register("updatedTitle", {
                        required: true,
                      })}
                    />
                    <button type="submit" className="hover:text-primary">
                      <RxCheck />
                    </button>
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
                  className={clsx("ml-auto flex items-center gap-2 opacity-0", {
                    "group-hover:opacity-100":
                      task.status === TaskStatus.NOT_DONE,
                    "opacity-100": task.status === TaskStatus.IN_EDIT,
                  })}
                >
                  <button
                    className="hover:text-primary"
                    onClick={() => handleDeleteTask(taskIndex)}
                  >
                    <RxTrash />
                  </button>

                  {match(task.status)
                    .with(TaskStatus.IN_EDIT, () => (
                      <button
                        className="hover:text-primary"
                        onClick={() => toggleTriggerUpdateTask(taskIndex)}
                      >
                        <RxCross2 />
                      </button>
                    ))
                    .otherwise(() => (
                      <button
                        className="hover:text-primary"
                        onClick={() => toggleTriggerUpdateTask(taskIndex)}
                      >
                        <RxPencil2 />
                      </button>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

export default App;
