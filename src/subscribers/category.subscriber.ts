/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  EntitySubscriberInterface,
  UpdateEvent,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Category } from '../modules/category/category.entity';
import { Actions, Audit } from '../modules/audit/audit.entity';

@EventSubscriber()
export class CategorySubscriber implements EntitySubscriberInterface<Category> {
  listenTo() {
    return Category;
  }

  async afterInsert(event: InsertEvent<Category>): Promise<any> {
    const auditRepository = event.manager.getRepository(Audit);

    const newRecord = event.entity;

    const newUpdatedAt = newRecord.createdAt;

    const newAudit = {
      entity: event.metadata.targetName,
      timestamp: newUpdatedAt,
      action: Actions.CREATE,
      newRecord: JSON.stringify({ ...newRecord }),
      oldRecord: null,
    } as unknown as Audit;

    await auditRepository.save(newAudit);
    return;
  }

  async beforeUpdate(event: UpdateEvent<Category>) {
    const queryRunner = event.queryRunner;
    const target = event.metadata.targetName;

    if (event.entity && (event.entity as Category).id) {
      const entityId = (event.entity as Category).id;

      const oldRecord = await queryRunner.manager.findOne(target, {
        where: { id: entityId },
        relations: ['parent'],
      });

      if (!queryRunner.data.oldRecords) {
        queryRunner.data.oldRecords = new Map();
      }
      queryRunner.data.oldRecords.set(entityId, oldRecord);
    }
  }

  async afterUpdate(event: UpdateEvent<Category>) {
    const queryRunner = event.queryRunner;
    const entityId = (event.entity as Category).id;
    const auditRepository = event.manager.getRepository(Audit);

    const oldRecord = queryRunner.data.oldRecords?.get(entityId);
    const newRecord = event.entity ?? {};

    const newUpdatedAt = newRecord.updatedAt;
    const oldUpdatedAt = oldRecord.updatedAt;

    delete oldRecord.updatedAt;
    delete newRecord.updatedAt;

    if (JSON.stringify(oldRecord) !== JSON.stringify(newRecord)) {
      await auditRepository.save({
        entity: event.metadata.targetName,
        timestamp: newUpdatedAt,
        action: Actions.UPDATE,
        newRecord: JSON.stringify({ ...newRecord, updatedAt: newUpdatedAt }),
        oldRecord: JSON.stringify({
          ...oldRecord,
          updatedAt: oldUpdatedAt,
        }),
      });
    }
  }
}
