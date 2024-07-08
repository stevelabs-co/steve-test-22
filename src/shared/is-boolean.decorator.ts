import { BadRequestException, applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean as OriginalIsBoolean } from 'class-validator';

export const IsBoolean = () => {
  return applyDecorators(ToBoolean(), OriginalIsBoolean());
};

const ToBoolean = () => {
  const toPlain = Transform(({ value }) => value, {
    toPlainOnly: true,
  });

  const toClass = (target: any, key: string) =>
    Transform(({ obj }) => valueToBoolean(obj[key]), {
      toClassOnly: true,
    })(target, key);

  return (target: any, key: string) => {
    toPlain(target, key);
    toClass(target, key);
  };
};

function valueToBoolean(value: any) {
  if (String(value).toLowerCase() === 'true' || String(value) === '1') {
    return true;
  }
  if (String(value).toLowerCase() === 'false' || String(value) === '0') {
    return false;
  }

  throw new BadRequestException(`${value} is not a boolean type`);
}
