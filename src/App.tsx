import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { P, match } from "ts-pattern";
import { RxMagnifyingGlass } from "react-icons/rx";
import { RxCheck } from "react-icons/rx";
import { RxCross2 } from "react-icons/rx";
import { useIsFirstRender } from "./hooks/render";
import { useLocalStorageState } from "./hooks/storage";
import { Task as TaskComponent, mapStringToVariant } from "./components/Task";
import { v4 as uuidv4 } from "uuid";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  subTasks?: Task[];
};

export enum TaskStatus {
  DONE = "done",
  NOT_DONE = "notDone",
  IN_EDIT = "inEdit",
}

function App() {
  const [tasks, setTasks] = useLocalStorageState<Task[]>("app.tasks", [
    {
      id: uuidv4(),
      title: "Todo.dev",
      status: TaskStatus.NOT_DONE,
      subTasks: [
        {
          id: uuidv4(),
          title: "child task",
          status: TaskStatus.NOT_DONE,
        },
        {
          id: uuidv4(),
          title: "keyboard accessibility",
          status: TaskStatus.NOT_DONE,
        },
        {
          id: uuidv4(),
          title: "command pallete",
          status: TaskStatus.NOT_DONE,
        },
      ],
    },
    {
      id: uuidv4(),
      title: "think 5k project",
      status: TaskStatus.NOT_DONE,
    },
  ]);

  const isFirstRender = useIsFirstRender();

  const [activeSearchQuery, setActiveSearchQuery] = useState<string | null>(
    null
  );

  const formCreate = useForm<{
    newTitle: string;
  }>();

  const [parentTaskIdForCreate, setParentTaskIdForCreate] = useState<
    string | null
  >(null);

  const formSearch = useForm<{ searchQuery: string }>();

  const onCreateSubTask = (parentTaskId: string) => {
    setParentTaskIdForCreate(parentTaskId);
  };

  const onCancelCreateSubTask = () => {
    setParentTaskIdForCreate(null);
  };

  const handleCreateTask = (formValue: Task["title"]) => {
    if (parentTaskIdForCreate) {
      setTasks((prev) => {
        return prev.map((task) => {
          if (task.id === parentTaskIdForCreate) {
            return {
              ...task,
              subTasks: [
                ...(task?.subTasks?.length
                  ? [
                      ...task.subTasks,
                      {
                        id: uuidv4(),
                        title: formValue,
                        status: TaskStatus.NOT_DONE,
                      },
                    ]
                  : [
                      {
                        id: uuidv4(),
                        title: formValue,
                        status: TaskStatus.NOT_DONE,
                      },
                    ]),
              ],
            };
          } else {
            return task;
          }
        });
      });

      setParentTaskIdForCreate(null);
    } else {
      setTasks((prev) => [
        ...prev,
        {
          id: uuidv4(),
          title: formValue,
          status: TaskStatus.NOT_DONE,
        },
      ]);
    }

    formCreate.setValue("newTitle", "");
  };

  const handleToggleTask = (taskId: string) => {
    const toggleTaskStatus = (task: Task): Task => {
      if (task.subTasks) {
        task.subTasks = [...task.subTasks.map(toggleTaskStatus)];
      }

      if (task.id === taskId) {
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
    };

    setTasks((prev) => prev.map(toggleTaskStatus));
  };

  const toggleTriggerUpdateTask = (taskId: string, parentId?: string) => {
    setTasks((prev) => {
      if (parentId) {
        return prev.map((task) => {
          if (task.id === parentId) {
            return {
              ...task,
              subTasks: task.subTasks?.map((v) => {
                if (v.id === taskId) {
                  return {
                    ...v,
                    status: match(v.status)
                      .with(TaskStatus.IN_EDIT, () => TaskStatus.NOT_DONE)
                      .otherwise(() => TaskStatus.IN_EDIT),
                  };
                } else {
                  return v;
                }
              }),
            };
          } else {
            return task;
          }
        });
      } else {
        return prev.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              status: match(task.status)
                .with(TaskStatus.IN_EDIT, () => TaskStatus.NOT_DONE)
                .otherwise(() => TaskStatus.IN_EDIT),
            };
          } else {
            return task;
          }
        });
      }
    });
  };

  const handleUpdateTask = (
    updatedTitle: string,
    taskId: string,
    parentId?: string
  ) => {
    setTasks((prev) => {
      if (parentId) {
        return prev.map((task) => {
          if (task.id === parentId) {
            return {
              ...task,
              subTasks: task.subTasks?.map((v) => {
                if (v.id === taskId) {
                  return {
                    ...v,
                    title: updatedTitle,
                    status: TaskStatus.NOT_DONE,
                  };
                } else {
                  return v;
                }
              }),
            };
          } else {
            return task;
          }
        });
      } else {
        return prev.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              title: updatedTitle,
              status: TaskStatus.NOT_DONE,
            };
          } else {
            return task;
          }
        });
      }
    });
  };

  const handleDeleteTask = (taskId: string, parentId?: string) => {
    if (parentId) {
      setTasks((prev) =>
        prev.map((v) => {
          if (v.id === parentId) {
            return {
              ...v,
              subTasks: v.subTasks?.filter((s) => s.id !== taskId),
            };
          } else {
            return v;
          }
        })
      );
    } else {
      setTasks((prev) => prev.filter((v) => v.id !== taskId));
    }
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
    ? tasks.filter((task) => {
        return (
          task.title.toLowerCase().search(activeSearchQuery) > -1 ||
          (task.subTasks?.findIndex((subTask) => {
            return subTask.title.toLowerCase().search(activeSearchQuery) > -1;
          }) ?? -1) > -1
        );
      })
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
            type="text"
            className="grow"
            placeholder="Create New Task"
            {...formCreate.register("newTitle", {
              required: true,
              onBlur: () => {
                formCreate.reset();
              },
            })}
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
            {displayedTasks.map((task) => (
              <li>
                <TaskComponent
                  id={task.id}
                  key={task.id}
                  title={task.title}
                  variant={mapStringToVariant(
                    match(task.status)
                      .with(TaskStatus.DONE, () => "done")
                      .with(TaskStatus.NOT_DONE, () => "notDone")
                      .with(TaskStatus.IN_EDIT, () => "inEdit")
                      .otherwise(() => "notDone")
                  )}
                  onClickToggle={() => handleToggleTask(task.id)}
                  onClickTriggerEdit={() => toggleTriggerUpdateTask(task.id)}
                  onClickCancelEdit={() => toggleTriggerUpdateTask(task.id)}
                  onSubmitEdit={(value) => handleUpdateTask(value, task.id)}
                  onClickDelete={() => handleDeleteTask(task.id)}
                  hasAddBtn
                  onClickAdd={() => onCreateSubTask(task.id)}
                />
                {task.subTasks?.length ? (
                  <ul className="ml-10">
                    {task.subTasks.map((subTask) => (
                      <li>
                        <TaskComponent
                          id={subTask.id}
                          key={subTask.id}
                          title={subTask.title}
                          variant={mapStringToVariant(
                            match(subTask.status)
                              .with(TaskStatus.DONE, () => "done")
                              .with(TaskStatus.NOT_DONE, () => "notDone")
                              .with(TaskStatus.IN_EDIT, () => "inEdit")
                              .otherwise(() => "notDone")
                          )}
                          onClickTriggerEdit={() =>
                            toggleTriggerUpdateTask(subTask.id, task.id)
                          }
                          onClickCancelEdit={() =>
                            toggleTriggerUpdateTask(subTask.id, task.id)
                          }
                          onSubmitEdit={(value) =>
                            handleUpdateTask(value, subTask.id, task.id)
                          }
                          onClickToggle={() => handleToggleTask(subTask.id)}
                          onClickDelete={() =>
                            handleDeleteTask(subTask.id, task.id)
                          }
                        />
                      </li>
                    ))}
                    {parentTaskIdForCreate === task.id && (
                      <li key={`task-sub-task-form`}>
                        <TaskComponent
                          id="task-sub-task-form"
                          variant="inCreate"
                          onSubmitEdit={handleCreateTask}
                          onClickCancelEdit={onCancelCreateSubTask}
                        />
                      </li>
                    )}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

export default App;
