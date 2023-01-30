// scripts/mp4-to-mp3.ts
import "@johnlindquist/kit"
console.log(`Running mp4-to-mp3.ts`)
console.log(`After import...`)
var { stdout: file } = await $`ls -t | head -1`

console.log({ file })
file = file?.trim()
if (!file) {
  console.log(`No file found. Exiting early`)
  exit(0)
}
if (!file.endsWith(".mp4")) {
  console.log(`File is not an mp4. Exiting early`)
  exit(1)
}
var { name } = path.parse(file)
var output = `${name}.mp3`
console.log(`Converting ${file} to ${output}`)
await $`ffmpeg -i ${file} ${output}`
var octokit = github.getOctokit(await env("GITHUB_TOKEN"))
var tag_name = name
var releaseResponse = await octokit.rest.repos.createRelease({
  ...github.context.repo,
  tag_name,
  name: tag_name,
})
var uploadResponse = await octokit.rest.repos.uploadReleaseAsset({
  ...github.context.repo,
  release_id: releaseResponse.data.id,
  name: output,
  data: await readFile(output),
})
try {
  console.log(`Uploaded ${output} to ${uploadResponse.data.browser_download_url}`)
} catch (error) {
  console.log(error)
}
var url = `https://github.com/johnlindquist/kitapp/releases/download/${tag_name}/${output}`
console.log({ url })
