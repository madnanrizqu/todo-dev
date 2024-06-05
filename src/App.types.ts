export interface PageState {
  tasks: Task[];
  parentTaskIdForCreate: string | null;
  proMode: "enabled" | "disabled";
}

export type PageAction =
  | {
      type: "appendTask";
      payload: { newTitle: string };
    }
  | {
      type: "appendSubTask";
      payload: { newTitle: string; parentId: string };
    }
  | {
      type: "toggleDoneStatusTask";
      payload: { taskId: string };
    }
  | {
      type: "toggleDoneStatusSubTask";
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
    }
  | {
      type: "setParentIdForCreate";
      payload: {
        parentId: string | null;
      };
    }
  | {
      type: "enableProMode";
    }
  | {
      type: "disableProMode";
    };

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
