const VERIFICATION_CODE = '34f52fvbtbbgy78yBbi76KHGuyggvjGvmHjh7';

// Данный посредник проверяет, валиден ли клиент отправивший данные
export const verifyClient = async (req, res, next) => {
  // console.log('Request url: ', req.originalUrl);
  const verificationCode = req.headers['x-verification-code'];

  if (!verificationCode || verificationCode !== VERIFICATION_CODE) {
    return res.status(403).json({ message: 'Inccorect client' })
  }

  next();
}
