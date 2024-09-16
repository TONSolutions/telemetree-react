import React, {useState} from 'react';
import TwaListTasksModal from "../TwaListTasksModal";

const TwaListTasksButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  return (
    <>
      <div onClick={handleOpenModal}>
        Button
      </div>

      {isModalOpen && <TwaListTasksModal />}
    </>
  );
};

export default TwaListTasksButton;