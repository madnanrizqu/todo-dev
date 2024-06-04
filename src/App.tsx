import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { P, match } from "ts-pattern";
import { RxMagnifyingGlass } from "react-icons/rx";
import { RxCheck } from "react-icons/rx";
import { RxCross2 } from "react-icons/rx";
import { useIsFirstRender } from "./hooks/render";
import { Task as TaskComponent, mapStringToVariant } from "./components/Task";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorageReducer } from "./hooks/storage";

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

interface PageState {
  tasks: Task[];
}

type PageAction =
  | {
      type: "appendTask";
      payload: { newTitle: string };
    }
  | {
      type: "appendSubTask";
      payload: { newTitle: string; parentId: string };
    }
  | {
      type: "toggleDoneNotDoneTask";
      payload: { taskId: string };
    }
  | {
      type: "toggleDoneNotDoneSubTask";
      payload: { taskId: string; parentId: string };
    }
  | {
      type: "toggleUpdateStatusTask";
      payload: { taskId: string };
    }
  | {
      type: "toggleUpdateStatusSubTask";
      payload: { taskId: string; parentId: string };
    }
  | {
      type: "updateSubTask";
      payload: { taskId: string; parentId: string; newTitle: string };
    }
  | {
      type: "updateTask";
      payload: { taskId: string; newTitle: string };
    }
  | {
      type: "deleteTask";
      payload: {
        taskId: string;
      };
    }
  | {
      type: "deleteSubTask";
      payload: {
        taskId: string;
        parentId: string;
      };
    };

function pageReducer(state: PageState, action: PageAction) {
  const { type, payload } = action;
  switch (type) {
    case "appendTask":
      return {
        tasks: [
          ...state.tasks,
          {
            id: uuidv4(),
            title: payload.newTitle,
            status: TaskStatus.NOT_DONE,
          },
        ],
      };
    case "appendSubTask":
      return {
        tasks: state.tasks.map((task) => {
          if (task.id === payload.parentId) {
            return {
              ...task,
              subTasks: task.subTasks
                ? [
                    ...task.subTasks,
                    {
                      id: uuidv4(),
                      title: payload.newTitle,
                      status: TaskStatus.NOT_DONE,
                    },
                  ]
                : [
                    {
                      id: uuidv4(),
                      title: payload.newTitle,
                      status: TaskStatus.NOT_DONE,
                    },
                  ],
            };
          } else {
            return task;
          }
        }),
      };
    case "toggleDoneNotDoneTask":
      return {
        tasks: state.tasks.map((task) => {
          if (task.id === payload.taskId) {
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
        }),
      };
    case "toggleDoneNotDoneSubTask":
      return {
        tasks: state.tasks.map((task) => {
          if (task.id === payload.parentId) {
            return {
              ...task,
              subTasks: task?.subTasks?.map((subTask) => {
                if (subTask.id === payload.taskId) {
                  return {
                    ...subTask,
                    status: match(subTask.status)
                      .with(TaskStatus.DONE, () => TaskStatus.NOT_DONE)
                      .with(TaskStatus.NOT_DONE, () => TaskStatus.DONE)
                      .run(),
                  };
                } else {
                  return subTask;
                }
              }),
            };
          } else {
            return task;
          }
        }),
      };
    case "toggleUpdateStatusTask":
      return {
        tasks: state.tasks.map((task) => {
          if (task.id === payload.taskId) {
            return {
              ...task,
              status: match(task.status)
                .with(TaskStatus.IN_EDIT, () => TaskStatus.NOT_DONE)
                .otherwise(() => TaskStatus.IN_EDIT),
            };
          } else {
            return task;
          }
        }),
      };
    case "toggleUpdateStatusSubTask":
      return {
        tasks: state.tasks.map((task) => {
          if (task.id === payload.parentId) {
            return {
              ...task,
              subTasks: task.subTasks?.map((v) => {
                if (v.id === payload.taskId) {
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
        }),
      };
    case "updateTask":
      return {
        tasks: state.tasks.map((task) => {
          if (task.id === payload.taskId) {
            return {
              ...task,
              title: payload.newTitle,
              status: TaskStatus.NOT_DONE,
            };
          } else {
            return task;
          }
        }),
      };
    case "updateSubTask":
      return {
        tasks: state.tasks.map((task) => {
          if (task.id === payload.parentId) {
            return {
              ...task,
              subTasks: task.subTasks?.map((v) => {
                if (v.id === payload.taskId) {
                  return {
                    ...v,
                    title: payload.newTitle,
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
        }),
      };
    case "deleteTask":
      return {
        tasks: state.tasks.filter((v) => v.id !== payload.taskId),
      };
    case "deleteSubTask":
      return {
        tasks: state.tasks.map((v) => {
          if (v.id === payload.parentId) {
            return {
              ...v,
              subTasks: v.subTasks?.filter((s) => s.id !== payload.taskId),
            };
          } else {
            return v;
          }
        }),
      };
    default:
      return state;
  }
}

function App() {
  const [pageState, pageDispatch] = useLocalStorageReducer(
    "state",
    pageReducer,
    {
      tasks: [
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
      ],
    }
  );

  const { tasks } = pageState;

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

    const el = document.getElementById(
      `task-${parentTaskId}-sub-task-form-input`
    );
    console.log("el", el);

    el?.focus();
  };

  const onCancelCreateSubTask = () => {
    setParentTaskIdForCreate(null);
  };

  const handleCreateTask = (formValue: Task["title"]) => {
    if (parentTaskIdForCreate) {
      pageDispatch({
        type: "appendSubTask",
        payload: { newTitle: formValue, parentId: parentTaskIdForCreate },
      });

      setParentTaskIdForCreate(null);
    } else {
      pageDispatch({ type: "appendTask", payload: { newTitle: formValue } });
    }

    formCreate.setValue("newTitle", "");
  };

  const handleToggleTask = (taskId: string, parentId?: string) => {
    if (parentId) {
      pageDispatch({
        type: "toggleDoneNotDoneSubTask",
        payload: { taskId, parentId },
      });
    } else {
      pageDispatch({ type: "toggleDoneNotDoneTask", payload: { taskId } });
    }
  };

  const toggleTriggerUpdateTask = (taskId: string, parentId?: string) => {
    if (parentId) {
      pageDispatch({
        type: "toggleUpdateStatusSubTask",
        payload: { taskId, parentId },
      });
    } else {
      pageDispatch({
        type: "toggleUpdateStatusTask",
        payload: { taskId },
      });
    }
  };

  const handleUpdateTask = (
    updatedTitle: string,
    taskId: string,
    parentId?: string
  ) => {
    if (parentId) {
      pageDispatch({
        type: "updateSubTask",
        payload: {
          newTitle: updatedTitle,
          taskId,
          parentId,
        },
      });
    } else {
      pageDispatch({
        type: "updateTask",
        payload: {
          newTitle: updatedTitle,
          taskId,
        },
      });
    }
  };

  const handleDeleteTask = (taskId: string, parentId?: string) => {
    if (parentId) {
      pageDispatch({
        type: "deleteSubTask",
        payload: {
          taskId,
          parentId,
        },
      });
    } else {
      pageDispatch({
        type: "deleteTask",
        payload: {
          taskId,
        },
      });
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
    <main className="container mx-auto space-y-16 py-20 px-8 lg:px-64">
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
                <ul className="ml-10">
                  {task?.subTasks?.map((subTask) => (
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
                        onClickToggle={() =>
                          handleToggleTask(subTask.id, task.id)
                        }
                        onClickDelete={() =>
                          handleDeleteTask(subTask.id, task.id)
                        }
                      />
                    </li>
                  ))}

                  <li
                    className={clsx({
                      "opacity-0": parentTaskIdForCreate !== task.id,
                      "h-0": parentTaskIdForCreate !== task.id,
                      "w-0": parentTaskIdForCreate !== task.id,
                    })}
                    key={`task-${task.id}-sub-task-form`}
                  >
                    <TaskComponent
                      id={`task-${task.id}-sub-task-form`}
                      variant="inCreate"
                      onSubmitEdit={handleCreateTask}
                      onClickCancelEdit={onCancelCreateSubTask}
                    />
                  </li>
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

export default App;
