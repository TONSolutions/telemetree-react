import styled from "styled-components";

export const Root = styled.div<{ fullScreen?: boolean; zIndex?: number }>`
  position: absolute;
  z-index: ${({ zIndex }) => zIndex ?? 15};
  width: 100%;
  inset: 0;
  opacity: 1;
  transition: opacity 0.5s ease-in-out;
  margin: 0;
  background-color: rgba(0, 0, 0, 0.4);
  height: 100vh;
  display: flex;
  align-items: end;

  color: var(--twa-font-primary, #000);
  //font-family: var(--twa-font-primary, "Roboto");

  @media (min-width: 431px) {
    align-items: center;
    justify-content: center;
  }
`;

export const Body = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.modalBgColor};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  border-top-left-radius: 1.5rem;
  border-top-right-radius: 1.5rem;
  background-color: var(--twa-body-background-color, #fff);

  @media (min-width: 431px) {
    max-width: 431px;
    border-radius: 1.5rem;
  }
`;

export const Header = styled.div`
  display: flex;
  height: 50px;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
`;

export const TitleHeader = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--twa-header-color, #50a8eb);
`;

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  gap: 10px;

  border-top: 1px solid var(--twa-border-color, #50a8eb);

  :hover {
    opacity: 0.8;
  }
`;

export const ImageRow = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 1.5px;
`;

export const TaskDescription = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  font-size: 1.2rem;
  font-weight: 500;
  color: var(--twa-font-primary, #000);
`;

export const Text = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--twa-font-primary, #000);
`;

export const TextLite = styled.div`
  font-size: 1rem;
  font-weight: 400;
  color: var(--twa-font-primary, #000);
`;

export const ButtonBlock = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 0 30px;
`;

export const ButtonTask = styled.button`
  width: 100%;
  height: 33px;
  border-radius: 10px;
  padding: 5px 15px;
  font-size: 1.25rem;
  background: var(--twa-button-background-color, #50a8eb);
`;
