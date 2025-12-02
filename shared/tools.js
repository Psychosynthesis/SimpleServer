import { COLORS } from './constants.js'

export const isProd = typeof process.env.NODE_ENV === 'string' && !process.env.NODE_ENV.toLowerCase().includes('dev');

export const getStartMessage = (port) => (
`${COLORS.magenta}
 ░█▀▄░▀█▀░█▀▀░█▀█░█▀▀░█▀█░█▀▀░█▀▀
 ░█░█░░█░░▀▀█░█▀▀░█▀▀░█░█░▀▀█░█▀▀
 ░▀▀░░▀▀▀░▀▀▀░▀░░░▀▀▀░▀░▀░▀▀▀░▀▀▀

 ${COLORS.cyan}Dispense server listening on port${COLORS.reset} ${port ?? 3000}
`);

export const isErrorWithMessage = (error) => {
  return error instanceof Error && 'message' in error;
};

export const isErrorWithCode = (error) => {
  return error instanceof Error && 'code' in error;
};
