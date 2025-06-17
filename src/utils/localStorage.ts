
// Utility functions for managing localStorage data
export const getCreatorInfo = () => {
  const creatorId = localStorage.getItem('football_creator_id');
  const creatorNickname = localStorage.getItem('football_creator_nickname');
  
  console.log('Retrieved creator info from localStorage:', { creatorId, creatorNickname });
  
  return {
    creatorId,
    creatorNickname,
    isCreator: Boolean(creatorId && creatorNickname)
  };
};

export const setCreatorInfo = (id: string, nickname: string) => {
  localStorage.setItem('football_creator_id', id);
  localStorage.setItem('football_creator_nickname', nickname);
  console.log('Saved creator info to localStorage:', { id, nickname });
};

export const clearCreatorInfo = () => {
  localStorage.removeItem('football_creator_id');
  localStorage.removeItem('football_creator_nickname');
  console.log('Cleared creator info from localStorage');
};
