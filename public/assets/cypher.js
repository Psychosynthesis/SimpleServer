// ArrayBuffer -> Base64
const pack = buffer => window.btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));

// Base64 -> ArrayBuffer
const unpack = (base64) => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const key = unpack('LnP02IO8s638ThgOQTvo6Q==');

const generateIV = () => {
  const iv = forge.random.getBytes(16); // Генерация 16 байт (128 бит)
  return forge.util.encode64(iv); // Возвращаем IV в base64
};

const encrypt = (plaintext, key, iv) => {
  const cipher = forge.cipher.createCipher('AES-CTR', forge.util.createBuffer(key));
  cipher.start({ iv: forge.util.createBuffer(unpack(iv)) });
  const encoder = new TextEncoder('utf-8'); // Преобразуем текст в байты
  const bytes = encoder.encode(plaintext);
  cipher.update(forge.util.createBuffer(bytes)); // Шифруем данные
  cipher.finish();

  const encryptedBytes = cipher.output.getBytes();
  return forge.util.encode64(encryptedBytes); // Возвращаем зашифрованные данные в base64
};

const decrypt = (ciphertext, key, iv) => {
  const decipher = forge.cipher.createDecipher('AES-CTR', forge.util.createBuffer(key));
  decipher.start({ iv: forge.util.createBuffer(iv) });
  decipher.update(forge.util.createBuffer(ciphertext));
  decipher.finish();
  const bytes = decipher.output.getBytes(); // Получаем бинарные данные и конвертируем в UTF-8
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(new Uint8Array(forge.util.binary.raw.decode(bytes)));
};
