import {
  randomBytes,
  pbkdf2Sync,
  createCipheriv,
  createDecipheriv,
} from 'crypto';
import { extname } from 'path';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { v4 as uuidV4 } from 'uuid';
import { HttpException } from '../exceptions/http.exception';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * pipe 함수
 */
export const pipe =
  <T>(...funcs: ((v: T) => T)[]) =>
  (v: T) =>
    funcs.reduce((res, fn) => fn(res), v);

/**
 * 데이터 암호화
 */
export const encryptData = (data: string, key: string) => {
  const iv = Buffer.alloc(16, 0); // 16비트
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  let encryptedText = cipher.update(data, 'utf8', 'base64');
  encryptedText += cipher.final('base64');

  return encryptedText;
};

/**
 * 데이터 복호화
 */
export const decryptData = (data: string, key: string) => {
  const iv = Buffer.alloc(16, 0); // 16비트

  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  let decryptedText = decipher.update(data, 'base64', 'utf8');
  decryptedText += decipher.final('utf8');

  return decryptedText;
};

/**
 * 랜덤 코드 생성
 */
export const createRandomCode = (length: number, mixString = false) => {
  return Array.from({ length })
    .map(() => {
      return mixString
        ? Math.floor((35 - 0 + 1) * Math.random() + 0).toString(36)
        : Math.floor((9 - 0 + 1) * Math.random() + 0).toString(10);
    })
    .join('');
};

/**
 * salt기반 평문 해시화
 */
export const toHashedPassword = (plainPassword: string, salt: string) => {
  return pbkdf2Sync(plainPassword, salt, 100000, 64, 'sha512').toString('hex');
};

/**
 * salt 값 생성
 */
export const createSalt = () => {
  return randomBytes(64).toString('hex');
};

/**
 * uri 인코딩된 문자열 확인
 */
export const isEncodedUriComponent = (str: string) => {
  return typeof str === 'string' && decodeURIComponent(str) !== str;
};

/**
 * uri 인코딩 안되어 있으면 인코딩
 */
export const toEncodeUriComponent = (str: string) => {
  return isEncodedUriComponent(str) ? str : encodeURIComponent(str);
};

/**
 * 이메일 마스킹
 */
export const maskEmail = (email: string): string => {
  const [id, domain] = email.split('@');
  const maskedId = id.slice(0, -2) + '**';

  return `${maskedId}@${domain}`;
};

/**
 * replace empty처리
 */
export const replaceEmpty = (target: string, exceptWord: string) => {
  return target.replace(new RegExp(`${exceptWord}`, 'g'), '');
};

/**
 * string to {string:string}
 */
export const toRecord = (str: string[]) =>
  str.reduce(
    (acc, el): Readonly<Record<string, string>> => ({ ...acc, [el]: el }),
    {},
  );

/**
 * 랜덤 파일명 생성
 */
export const createRandomFilename = (filename: string) => {
  return uuidV4() + getFileExtension(filename);
};

/**
 * 파일 확장자 가져오기
 */
export const getFileExtension = (filename: string) => {
  return extname(filename);
};

/**
 * UTC to KST
 */
export const utcToKst = (utcDate: Date) => {
  return dayjs(utcDate).add(9, 'hours').toDate();
};

/**
 * KST to UTC
 */
export const kstToUtc = (kstDate: Date) => {
  return dayjs(kstDate).subtract(9, 'hours').toDate();
};

/**
 * DATE format YYYY-MM-DD
 */
export const justDate = (UTC: Date) => {
  return dayjs(UTC).tz('asia/seoul').format('YYYY-MM-DD');
};

export const justTime = (UTC: Date) => {
  return dayjs(UTC).tz('asia/seoul').format('HH:mm');
};

/**
 * 타겟월 시작과 끝
 */

export const targetPeriod = (year: number, month: number) => {
  const startOfTargetPeriod = dayjs()
    .set('year', year)
    .set('month', month >= 0 ? month : 0)
    .tz('asia/seoul')
    .startOf('month')
    // .subtract(9, 'h')
    .format();
  const endOfTargetPeriod = dayjs()
    .set('year', year)
    .set('month', month >= 0 ? month : 11)
    .tz('asia/seoul')
    .endOf('month')
    .format();

  return { startOfTargetPeriod, endOfTargetPeriod };
};

/**
 * 해당년도 시작과 끝
 */
export const yearStartEND = (year: number) => {
  const yearStart = dayjs()
    .set('year', year)
    .startOf('year')
    .subtract(9, 'h')
    .format();
  const yearEnd = dayjs()
    .set('year', year)
    .endOf('year')
    .subtract(9, 'h')
    .format();
  return { yearStart, yearEnd };
};

/**
 * NaN없애기
 */
export const noNaN = (data: any) => {
  if (isNaN(data)) {
    return 0;
  } else {
    if (!isFinite(data)) {
      return 0;
    }
    return Number(data);
  }
};

/**
 * date 중 빈스트링 null반환
 */
export const dateEmptyStringToNull = (value: Date | string) => {
  if (value !== '') return value as Date;
  else return null;
};

/**
 * 요일반환
 */
export const getDay = (day: number) => {
  switch (day) {
    case 0: {
      return '일';
    }
    case 1: {
      return '월';
    }
    case 2: {
      return '화';
    }
    case 3: {
      return '수';
    }
    case 4: {
      return '목';
    }
    case 5: {
      return '금';
    }
    case 6: {
      return '토';
    }
    default: {
      throw new HttpException({
        code: '1000',
        message: '존재하지 않는 요일입니다.',
      });
    }
  }
};
