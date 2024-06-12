import { EMicroAppIdITest, EMicroAppIdProd } from '@plugin/request/chat/type';

const useGetScenes = (microAppId?: number) => {
  const isEduKnowledgeScenes = !!(
    microAppId && [EMicroAppIdITest.EDU_KNOWLEDGE, EMicroAppIdProd.EDU_KNOWLEDGE].includes(microAppId)
  );
  const isEduPhotoScenes = !!(
    microAppId && [EMicroAppIdITest.EDU_PHOTO, EMicroAppIdProd.EDU_PHOTO].includes(microAppId)
  );
  const isBeautySummaryScenes = !!(
    microAppId && [EMicroAppIdITest.BEAUTY_SUMMARY, EMicroAppIdProd.BEAUTY_SUMMARY].includes(microAppId)
  );
  const isEduBehaviorScenes = !!(
    microAppId && [EMicroAppIdITest.EDU_BEHAVIOR, EMicroAppIdProd.EDU_BEHAVIOR].includes(microAppId)
  );

  return {
    isEduKnowledgeScenes,
    isEduPhotoScenes,
    isBeautySummaryScenes,
    isEduBehaviorScenes,
  };
};

export default useGetScenes;
