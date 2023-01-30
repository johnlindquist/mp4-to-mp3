import "@johnlindquist/kit"

// get the most recently added file in the current directory
let { stdout: file } = await $`ls -t | head -1`

file = file?.trim()

if (!file) {
  console.log(`No file found. Exiting early`)
  exit(0)
}

if (!file.endsWith(".mp4")) {
  console.log(`File is not an mp4. Exiting early`)
  exit(1)
}

let { name } = path.parse(file)
let output = `${name}.mp3`

// convert the file to mp3
await $`ffmpeg -i ${file} ${output}`

// TODO: Add types for github actions to kit repo
declare const github: any

let octokit = github.getOctokit(await env("GITHUB_TOKEN"))

let tag_name = name

let releaseResponse = await octokit.rest.repos.createRelease({
  ...github.context.repo,
  tag_name,
  name: tag_name,
  prerelease: true,
  draft: true,
})

let uploadResponse = await octokit.rest.repos.uploadReleaseAsset({
  ...github.context.repo,
  release_id: releaseResponse.data.id,
  name: output,
  data: await readFile(output),
})

let url = `https://github.com/johnlindquist/kitapp/releases/download/${tag_name}/${output}`

console.log({ url })
