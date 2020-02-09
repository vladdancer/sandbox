const { Snippet } = require('enquirer');
const prompt = new Snippet({
  name: 'service.php',
  message: 'Check php service',
  required: true,
  fields: [
    {
      name: 'php_tag',
      message: 'PHP Tag',
      initial: '7.4-dev-4.14.0'
    },
    {
      name: 'project_dir',
      initial: '/home/vlad/projects/test/vlad_test_snd',
    },
    {
      name: 'mount_mode',
      initial: 'cached',
    },
    {
      name: 'volume_dest',
      initial: '/var/www/html',
    }
  ],
  template: `{
  "image": "wodby/php:\${php_tag}",
  "projectDir": "\${project_dir}",
  "mountMode": "\${mount_mode}",
  "volumeSrc": "\${project_dir}",
  "volumeDest": "\${volume_dest}"
}
`
});

export default prompt;
