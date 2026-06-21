import { getNotionEntity, updateNotionEntity } from '../notion/main.js';

export async function togglePageLockState(pageId, notionToken) {
  const entity = await getNotionEntity(pageId, notionToken);
  const newLockState = !entity.data.is_locked;
  
  await updateNotionEntity(pageId, entity.type, { is_locked: newLockState }, notionToken);
  
  return newLockState;
}
