import React, { useState } from "react";
import * as S from "./TwaListTasksModal.styles";
import BoundsIcon from "./assets/Bounds.svg";
import TwaTaskModal from "./TwaTaskModal";

// import {useTMATasks} from "../../hooks";
// import {Task} from "../../types";

const TwaListTasksModal = () => {
  const [openedTask, setOpenedTask] = useState<number | null>(null);
  /*const [tasks, setTasks] = useState<Task[]>([]);
  const { getTasks, tasksReady, displayTask, verifyTask } = useTMATasks();

  useEffect(() => {
    if (tasksReady) {
      // @ts-ignore
      getTasks()
        .then((data) => {
          console.log("getTasks", data);
          setTasks(data);
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
  }*/
  // , [tasksReady]);

  const handleOpenTask = (index: number) => {
    setOpenedTask(index);
  };
  const handleCloseTask = () => {
    setOpenedTask(null);
  };
  return (
    <S.Root>
      <S.Body>
        {openedTask !== null ? (
          <TwaTaskModal handleCloseTask={handleCloseTask} />
        ) : (
          <>
            <S.Header>
              <S.TitleHeader>Active</S.TitleHeader>
              <S.TitleHeader>Finished</S.TitleHeader>
              <S.TitleHeader>All</S.TitleHeader>
            </S.Header>

            <S.Row onClick={() => handleOpenTask(0)}>
              <S.ImageRow src={"https://i.imgur.com/r3m5o4S.png"} alt="active" />
              <S.TaskDescription>
                <S.Text>Game X</S.Text>
                <S.TextLite>Earn Multiple Rewards</S.TextLite>
              </S.TaskDescription>

              <S.ButtonBlock>
                <S.ButtonTask>700</S.ButtonTask>
              </S.ButtonBlock>

              <div>
                <img src={BoundsIcon} alt="active" />
              </div>
            </S.Row>
          </>
        )}

        {/*{tasks.map((task: Task) => (*/}
        {/*  <div >*/}
        {/*    {task.name}*/}
        {/*  </div>*/}
        {/*))}*/}
      </S.Body>
    </S.Root>
  );
};

export default TwaListTasksModal;
