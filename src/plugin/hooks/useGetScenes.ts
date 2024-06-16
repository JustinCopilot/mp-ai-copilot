import { EMicroAppUuid } from '@plugin/request/chat/type';

const useGetScenes = (microAppUuid?: EMicroAppUuid) => {
  const isEduKnowledgeScenes = microAppUuid === EMicroAppUuid.EDU_KNOWLEDGE
  const isEduPhotoScenes = microAppUuid === EMicroAppUuid.EDU_PHOTO
  const isBeautySummaryScenes = microAppUuid === EMicroAppUuid.BEAUTY_SUMMARY
  const isEduBehaviorScenes = microAppUuid === EMicroAppUuid.EDU_BEHAVIOR

  return {
    isEduKnowledgeScenes,
    isEduPhotoScenes,
    isBeautySummaryScenes,
    isEduBehaviorScenes,
  };
};

export default useGetScenes;
