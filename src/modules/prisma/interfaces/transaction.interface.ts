import { PrismaService } from '../prisma.service';

export type PrismaTransaction = Omit<PrismaService, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>;
