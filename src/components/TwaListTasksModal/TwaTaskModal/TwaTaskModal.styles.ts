import styled from "styled-components";

export const Header = styled.div`
  display: flex;
  height: 50px;
  justify-content: flex-start;
  align-items: center;
  padding: 0 10px;

  font-size: 1.5rem;
  font-weight: 500;
  border-bottom: 1px solid var(--twa-border-color, #50a8eb);
  gap: 10px;
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 10px;

  gap: 10px;
`;

export const TaskDetails = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
`;

export const Image = styled.img`
  width: 156px;
  height: 156px;
  object-fit: cover;
  border-radius: 1.5rem;
`;

export const TextAbout = styled.span`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
`;

export const About = styled.span`
  text-align: left;
  font-weight: 400;
`;

export const Title = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1;
`;

export const Button = styled.button`
  width: 100%;
  border-radius: 10px;
  padding: 15px 15px;
  font-size: 1.25rem;
  background: var(--twa-button-task-background-color, #007aff);
`;

export const EarnBlock = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
`;

export const EarnText = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--twa-font-about, #82868a);
  line-height: 1;
`;

export const TokensText = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 1;
`;

export const NoteBlock = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;

  text-align: left;
`;

export const NoteText = styled.div`
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--twa-font-about, #82868a);
`;

export const InfoIcon = styled.img`
  width: 28px;
  height: 28px;
  object-fit: cover;
`;
