
const isNotEmpty = async (input: string, failMsg?: 'string') => {
  return new Promise((resolve, reject) => {
    input === ''
      ? reject(failMsg || 'Parameter can not be empty')
      : resolve(true);
  });
};

export default [
  {
    type: 'input',
    name: 'source_path',
    default: '/code',
    message: 'Enter relative path to source dir (where your .git or composer.json files lives)',
    async validate(input) {
      return await isNotEmpty(input);
    },
  }
]
