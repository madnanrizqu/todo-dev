import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { P, match } from "ts-pattern";
import { useIsFirstRender } from "./hooks/render";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorageReducer } from "./hooks/storage";
import { PageAction, PageState, Task, TaskStatus } from "./App.types";

const useAppIndex = () => {
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
      parentTaskIdForCreate: null,
      proMode: "enabled",
    }
  );

  const isFirstRender = useIsFirstRender();

  const [activeSearchQuery, setActiveSearchQuery] = useState<string | null>(
    null
  );

  const formCreate = useForm<{
    newTitle: string;
  }>();

  const formSearch = useForm<{ searchQuery: string }>();

  const onCreateSubTask = (parentTaskId: string) => {
    pageDispatch({
      type: "setParentIdForCreate",
      payload: { parentId: parentTaskId },
    });

    const el = document.getElementById(
      `task-${parentTaskId}-sub-task-form-input`
    );

    el?.focus();
  };

  const onCancelCreateSubTask = () => {
    pageDispatch({
      type: "setParentIdForCreate",
      payload: {
        parentId: null,
      },
    });
  };

  const handleCreateTask = (formValue: Task["title"]) => {
    if (pageState.parentTaskIdForCreate) {
      pageDispatch({
        type: "appendSubTask",
        payload: {
          newTitle: formValue,
          parentId: pageState.parentTaskIdForCreate,
        },
      });

      pageDispatch({
        type: "setParentIdForCreate",
        payload: {
          parentId: null,
        },
      });
    } else {
      pageDispatch({ type: "appendTask", payload: { newTitle: formValue } });
    }

    formCreate.setValue("newTitle", "");
  };

  const handleToggleTask = (taskId: string, parentId?: string) => {
    if (parentId) {
      pageDispatch({
        type: "toggleDoneStatusSubTask",
        payload: { taskId, parentId },
      });
    } else {
      pageDispatch({ type: "toggleDoneStatusTask", payload: { taskId } });
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

  const handleProModeChange = () => {
    pageDispatch({
      type:
        pageState.proMode === "enabled" ? "disableProMode" : "enableProMode",
    });
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

  useEffect(() => {
    if (isFirstRender) {
      // @ts-expect-error showModal exists from daisy ui
      document.getElementById("greetModal")?.showModal();
    }
  }, [isFirstRender]);

  const displayedTasks = activeSearchQuery
    ? pageState.tasks.filter((task) => {
        return (
          task.title.toLowerCase().search(activeSearchQuery) > -1 ||
          (task.subTasks?.findIndex((subTask) => {
            return subTask.title.toLowerCase().search(activeSearchQuery) > -1;
          }) ?? -1) > -1
        );
      })
    : pageState.tasks;

  return {
    handleCreateTask,
    handleDeleteTask,
    handleResetSearch,
    handleSearchTask,
    handleToggleTask,
    handleUpdateTask,
    toggleTriggerUpdateTask,
    onCancelCreateSubTask,
    onCreateSubTask,
    handleProModeChange,
    formCreate,
    formSearch,
    activeSearchQuery,
    parentTaskIdForCreate: pageState.parentTaskIdForCreate,
    displayedTasks,
    isProMode: pageState.proMode === "enabled",
  };
};

function pageReducer(state: PageState, action: PageAction): PageState {
  const { type } = action;

  switch (type) {
    case "appendTask":
      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            id: uuidv4(),
            title: action.payload.newTitle,
            status: TaskStatus.NOT_DONE,
          },
        ],
      };
    case "appendSubTask":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id === action.payload.parentId) {
            return {
              ...task,
              subTasks: task.subTasks
                ? [
                    ...task.subTasks,
                    {
                      id: uuidv4(),
                      title: action.payload.newTitle,
                      status: TaskStatus.NOT_DONE,
                    },
                  ]
                : [
                    {
                      id: uuidv4(),
                      title: action.payload.newTitle,
                      status: TaskStatus.NOT_DONE,
                    },
                  ],
            };
          } else {
            return task;
          }
        }),
      };
    case "toggleDoneStatusTask":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id === action.payload.taskId) {
            return {
              ...task,
              status: match(task.status)
                .with(TaskStatus.DONE, () => TaskStatus.NOT_DONE)
                .with(TaskStatus.NOT_DONE, () => TaskStatus.DONE)
                .run(),
              subTasks: task.subTasks
                ? task.subTasks.map((subTask) => ({
                    ...subTask,
                    status: match(task.status)
                      .with(TaskStatus.DONE, () => TaskStatus.NOT_DONE)
                      .with(TaskStatus.NOT_DONE, () => TaskStatus.DONE)
                      .run(),
                  }))
                : [],
            };
          } else {
            return task;
          }
        }),
      };
    case "toggleDoneStatusSubTask":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id === action.payload.parentId) {
            return {
              ...task,
              subTasks: task?.subTasks?.map((subTask) => {
                if (subTask.id === action.payload.taskId) {
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
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id === action.payload.taskId) {
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
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id === action.payload.parentId) {
            return {
              ...task,
              subTasks: task.subTasks?.map((v) => {
                if (v.id === action.payload.taskId) {
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
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id === action.payload.taskId) {
            return {
              ...task,
              title: action.payload.newTitle,
              status: TaskStatus.NOT_DONE,
            };
          } else {
            return task;
          }
        }),
      };
    case "updateSubTask":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id === action.payload.parentId) {
            return {
              ...task,
              subTasks: task.subTasks?.map((v) => {
                if (v.id === action.payload.taskId) {
                  return {
                    ...v,
                    title: action.payload.newTitle,
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
        ...state,
        tasks: state.tasks.filter((v) => v.id !== action.payload.taskId),
      };
    case "deleteSubTask":
      return {
        ...state,
        tasks: state.tasks.map((v) => {
          if (v.id === action.payload.parentId) {
            return {
              ...v,
              subTasks: v.subTasks?.filter(
                (s) => s.id !== action.payload.taskId
              ),
            };
          } else {
            return v;
          }
        }),
      };
    case "setParentIdForCreate":
      return {
        ...state,
        parentTaskIdForCreate: action.payload.parentId,
      };
    case "enableProMode":
      return {
        ...state,
        proMode: "enabled",
      };
    case "disableProMode":
      return {
        ...state,
        proMode: "disabled",
      };
    default:
      return state;
  }
}

export default useAppIndex;
