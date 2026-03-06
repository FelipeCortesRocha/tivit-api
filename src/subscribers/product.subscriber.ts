/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  EntitySubscriberInterface,
  UpdateEvent,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Product } from '../modules/product/product.entity';
import { Actions, Audit } from '../modules/audit/audit.entity';

@EventSubscriber()
export class ProductSubscriber implements EntitySubscriberInterface<Product> {
  listenTo() {
    return Product;
  }

  async afterInsert(event: InsertEvent<Product>): Promise<any> {
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

  async beforeUpdate(event: UpdateEvent<Product>) {
    const queryRunner = event.queryRunner;
    const target = event.metadata.targetName;

    if (event.entity && (event.entity as Product).id) {
      const entityId = (event.entity as Product).id;

      const oldRecord = await queryRunner.manager.findOne(target, {
        where: { id: entityId },
        relations: ['categories', 'categories.parent'],
      });

      if (!queryRunner.data.oldRecords) {
        queryRunner.data.oldRecords = new Map();
      }
      queryRunner.data.oldRecords.set(entityId, oldRecord);
    }
  }

  async afterUpdate(event: UpdateEvent<Product>) {
    const queryRunner = event.queryRunner;
    const entityId = (event.entity as Product).id;
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
