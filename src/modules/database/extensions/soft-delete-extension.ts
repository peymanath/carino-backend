import { Prisma, PrismaClient } from '@prisma/client';

const MODELS_WITH_SOFT_DELETE = new Set(Prisma.dmmf.datamodel.models.filter(m => m.fields.some(f => f.name === 'isDeleted' && f.type === 'Boolean')).map(m => m.name));

const internalClient = new PrismaClient();

const applySoftDeleteFilter = (args: any) => {
  args.where = args.where ?? {};

  if (args.where.isDeleted === undefined && !Object.keys(args.where).some(key => key.includes('isDeleted'))) {
    args.where = { ...args.where, isDeleted: false };
  }
  return args;
};

const removeIsDeletedFlag = (data: any) => {
  if (!data || typeof data !== 'object') return;

  if (Array.isArray(data)) {
    data.forEach(removeIsDeletedFlag);
    return;
  }

  delete data.isDeleted;

  for (const key in data) {
    if (data[key] && typeof data[key] === 'object') {
      removeIsDeletedFlag(data[key]);
    }
  }
};

const getModelClient = (model: string) => {
  const methodName = model.charAt(0).toLowerCase() + model.slice(1);
  return (internalClient as any)[methodName];
};

export const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  query: {
    $allModels: {
      async delete({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) return query(args);
        return getModelClient(model)?.update({
          where: args.where,
          data: { isDeleted: true },
        });
      },

      async deleteMany({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) return query(args);
        return getModelClient(model)?.updateMany({
          where: args.where,
          data: { isDeleted: true },
        });
      },

      async findUnique({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) return query(args);
        const result = await getModelClient(model)?.findUnique(applySoftDeleteFilter(args));
        removeIsDeletedFlag(result);
        return result;
      },

      async findUniqueOrThrow({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) return query(args);
        const result = await getModelClient(model)?.findUniqueOrThrow(applySoftDeleteFilter(args));
        removeIsDeletedFlag(result);
        return result;
      },

      async findFirst({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) return query(args);
        const result = await query(applySoftDeleteFilter(args));
        removeIsDeletedFlag(result);
        return result;
      },

      async findFirstOrThrow({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) return query(args);
        const result = await query(applySoftDeleteFilter(args));
        removeIsDeletedFlag(result);
        return result;
      },

      async findMany({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) return query(args);
        const result = await query(applySoftDeleteFilter(args));
        removeIsDeletedFlag(result);
        return result;
      },

      async count({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) return query(args);
        return query(applySoftDeleteFilter(args));
      },

      async aggregate({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) return query(args);
        return query(applySoftDeleteFilter(args));
      },

      async groupBy({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) return query(args);
        return query(applySoftDeleteFilter(args));
      },

      async upsert({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) return query(args);
        return query(args);
      },

      async update({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) return query(args);
        args.where = { ...args.where, isDeleted: false };
        const result = await query(args);
        removeIsDeletedFlag(result);
        return result;
      },

      async updateMany({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) return query(args);
        args.where = { ...args.where, isDeleted: false };
        return query(args);
      },
    },
  },
});
