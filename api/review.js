import nodemailer from 'nodemailer';

const DEFAULT_TO = 'vlsptm1130@naver.com';
const MAX_FIELD_LENGTH = 2000;

function clean(value) {
  return String(value ?? '').trim().slice(0, MAX_FIELD_LENGTH);
}

function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return json(res, 204, {});
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return json(res, 405, { message: 'POST 요청만 사용할 수 있어요.' });
  }

  if (!isConfigured()) {
    return json(res, 500, {
      message: '메일 서버 설정이 아직 없어요. Vercel 환경 변수에 SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS를 추가해 주세요.',
    });
  }

  const body = typeof req.body === 'object' && req.body ? req.body : {};
  const projectName = clean(body.projectName) || '제목 없음';
  const exportType = clean(body.exportType) || 'unknown';
  const quality = clean(body.quality) || '작성 없음';
  const painPoint = clean(body.painPoint) || '작성 없음';
  const wish = clean(body.wish) || '작성 없음';
  const page = clean(body.page) || 'unknown';
  const userAgent = clean(body.userAgent) || 'unknown';
  const submittedAt = clean(body.submittedAt) || new Date().toISOString();

  const to = process.env.FEEDBACK_TO_EMAIL || DEFAULT_TO;
  const from = process.env.FEEDBACK_FROM_EMAIL || process.env.SMTP_USER;
  const port = Number(process.env.SMTP_PORT);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : port === 465;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const text = [
      '[Mockfolio 저장 후 사용자 리뷰]',
      '',
      `프로젝트: ${projectName}`,
      `저장 형식: ${exportType}`,
      `만족도: ${quality}`,
      '',
      `불편하거나 헷갈린 점:`,
      painPoint,
      '',
      `다시 쓰고 싶게 만들 개선점:`,
      wish,
      '',
      `페이지: ${page}`,
      `브라우저: ${userAgent}`,
      `제출 시각: ${submittedAt}`,
    ].join('\n');

    await transporter.sendMail({
      from,
      to,
      subject: '[Mockfolio] 저장 후 사용자 리뷰',
      text,
    });

    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('Failed to send review email', error);
    return json(res, 502, {
      message: '메일을 보내지 못했어요. SMTP 계정, 비밀번호, 보안 설정을 확인해 주세요.',
    });
  }
}
