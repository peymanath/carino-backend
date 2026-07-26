import { Prisma, PrismaClient } from '@prisma/client';

const MODELS_WITH_SOFT_DELETE = new Set(Prisma.dmmf.datamodel.models.filter(model => model.fields.some(field => field.name === 'isDeleted' && field.type === 'Boolean')).map(model => model.name));

const internalClient = new PrismaClient();

type SoftDeleteArgs = {
  where?: Record<string, unknown>;
};

const applySoftDeleteFilter = <T extends SoftDeleteArgs>(args: T): T => {
  const where = args.where ?? {};

  if (where.isDeleted === undefined && !Object.keys(where).some(key => key.includes('isDeleted'))) {
    args.where = {
      ...where,
      isDeleted: false,
    };
  }

  return args;
};

const removeIsDeletedFlag = (data: unknown): void => {
  if (!data || typeof data !== 'object') {
    return;
  }

  if (Array.isArray(data)) {
    data.forEach(removeIsDeletedFlag);
    return;
  }

  const record = data as Record<string, unknown>;

  delete record.isDeleted;

  Object.values(record).forEach(value => {
    if (value && typeof value === 'object') {
      removeIsDeletedFlag(value);
    }
  });
};

const getModelClient = (model: string) => {
  const methodName = model.charAt(0).toLowerCase() + model.slice(1);

  return (internalClient as unknown as Record<string, unknown>)[methodName] as {
    update: (args: unknown) => Promise<unknown>;
    updateMany: (args: unknown) => Promise<unknown>;
    findUnique: (args: unknown) => Promise<unknown>;
    findUniqueOrThrow: (args: unknown) => Promise<unknown>;
  };
};

export const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',

  query: {
    $allModels: {
      async delete({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) {
          return query(args);
        }

        return getModelClient(model).update({
          where: args.where,
          data: {
            isDeleted: true,
          },
        });
      },

      async deleteMany({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) {
          return query(args);
        }

        return getModelClient(model).updateMany({
          where: args.where,
          data: {
            isDeleted: true,
          },
        });
      },

      async findUnique({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) {
          return query(args);
        }

        const result = await query(applySoftDeleteFilter(args));

        removeIsDeletedFlag(result);

        return result;
      },

      async findUniqueOrThrow({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) {
          return query(args);
        }

        const result = await query(applySoftDeleteFilter(args));

        removeIsDeletedFlag(result);

        return result;
      },

      async findFirst({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) {
          return query(args);
        }

        const result = await query(applySoftDeleteFilter(args));

        removeIsDeletedFlag(result);

        return result;
      },

      async findFirstOrThrow({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) {
          return query(args);
        }

        const result = await query(applySoftDeleteFilter(args));

        removeIsDeletedFlag(result);

        return result;
      },

      async findMany({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) {
          return query(args);
        }

        const result = await query(applySoftDeleteFilter(args));

        removeIsDeletedFlag(result);

        return result;
      },

      async count({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) {
          return query(args);
        }

        return query(applySoftDeleteFilter(args));
      },

      async aggregate({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) {
          return query(args);
        }

        return query(applySoftDeleteFilter(args));
      },

      async groupBy({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) {
          return query(args);
        }

        return query(applySoftDeleteFilter(args));
      },

      async upsert({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) {
          return query(args);
        }

        return query(args);
      },

      async update({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) {
          return query(args);
        }

        args.where = {
          ...args.where,
          isDeleted: false,
        };

        const result = await query(args);

        removeIsDeletedFlag(result);

        return result;
      },

      async updateMany({ model, args, query }) {
        if (!MODELS_WITH_SOFT_DELETE.has(model)) {
          return query(args);
        }

        args.where = {
          ...args.where,
          isDeleted: false,
        };

        return query(args);
      },
    },
  },
});
