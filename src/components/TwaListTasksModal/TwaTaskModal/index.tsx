import React, { FC } from "react";
import ArrowLeft from "../assets/arrow-left.svg";
import InfoIcon from "../assets/InfoIcon.svg";
import * as S from "./TwaTaskModal.styles";

type Props = {
  handleCloseTask: () => void;
};

const TwaTaskModal: FC<Props> = ({ handleCloseTask }) => {
  return (
    <>
      <S.Header>
        <img src={ArrowLeft} alt="arrow-left" onClick={handleCloseTask} />
        Back to Task List
      </S.Header>
      <S.Body>
        <S.TaskDetails>
          <S.Image src="https://i.imgur.com/r3m5o4S.png" alt="task-image" />
          <S.TextAbout>
            <S.About>
              <span style={{ color: "var(--twa-font-about, #82868A)" }}>About:</span> Project
              Description About Some Info Project Description About Some Info Project Description
              About Some Info Project Description About Some Info Project Description About Some
              Info Project{" "}
            </S.About>
          </S.TextAbout>
        </S.TaskDetails>
        <S.Title>Game X Long Name</S.Title>

        <S.About>
          <span style={{ color: "var(--twa-font-about, #82868A)" }}>Task Description:</span> Earn
          Multiple Rewards Earn Multiple Rewards Earn Multiple Rewards Earn Multiple Rewards Earn
          Multiple Rewards Earn Multiple Rewards Multiple Rewards Earn Multiple Rewards Earn
          Multiple Rewards Multiple Rewards Earn Multiple
        </S.About>

        <S.Button>Task</S.Button>

        <S.EarnBlock>
          <S.EarnText>Earn up to:</S.EarnText>
          <S.TokensText>777 tokens</S.TokensText>
        </S.EarnBlock>

        <S.NoteBlock>
          <S.InfoIcon src={InfoIcon} alt="info-icon" />
          <S.NoteText>Note: You must verify the task after completion to claim the tokens</S.NoteText>
        </S.NoteBlock>
        <S.Button>Verify</S.Button>
      </S.Body>
    </>
  );
};

export default TwaTaskModal;
