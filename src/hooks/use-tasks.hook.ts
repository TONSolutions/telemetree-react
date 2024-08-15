import {baseOptions, configApiGateway} from "../constants";
import {useContext, useEffect, useState} from "react";
import {TwaAnalyticsProviderContext} from "../components";
import {TaskManager} from "../modules";
import {TaskManagerError} from "../modules/task-manager";
import {Logger} from "../utils/logger";
import {EventBuilder} from "../builders";

export function useTMATasks() {
  const context = useContext(TwaAnalyticsProviderContext);
  const {taskManager, isInitialized} = context || {};
  const [tasksReady, setTasksReady] = useState(false);

  useEffect(() => {
    if (!taskManager || !(taskManager instanceof TaskManager) || !isInitialized) {
      setTasksReady(false);
    } else {
      setTasksReady(true);
    }
  }, [taskManager, isInitialized]);

  const getTasks = () => {
    return taskManager?.getTasks();
  }

  const displayTask = async (taskId: string) => {
    await taskManager?.displayedTaskShown(taskId);
  };

  const verifyTask = async (taskId: string) => {
    await taskManager?.verifyingTask(taskId);
  }

  return {
    getTasks,
    tasksReady,
    displayTask,
    verifyTask
  }
}