console.log(`Running mp4-to-mp3.ts`)

import "@johnlindquist/kit"

console.log(`After import...`)

console.log(`KENV: ${process.env.KENV}`)

// get the most recently added file in the current directory that is not a directory
let { stdout: file } = await $`ls -t $(find . -maxdepth 1 -type f) | head -1`

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

let { name } = path.parse(file)
let output = `${name}.mp3`

console.log(`Converting ${file} to ${output}`)

// convert the file to mp3
await $`ffmpeg -i ${file} ${output}`

console.log(`After ffmpeg...`)

// TODO: Add types for github actions to kit repo
declare const github: any

let octokit = github.getOctokit(await env("GITHUB_TOKEN"))

console.log(`After octokit...`)

let tag_name = name

let releaseResponse = await octokit.rest.repos.createRelease({
  ...github.context.repo,
  tag_name,
  name: tag_name,
})

console.log(`After releaseResponse...`)

let uploadResponse = await octokit.rest.repos.uploadReleaseAsset({
  ...github.context.repo,
  release_id: releaseResponse.data.id,
  name: output,
  data: await readFile(output),
})

console.log(`After uploadResponse...`)

try {
  console.log(`Uploaded ${output} to ${uploadResponse.data.browser_download_url}`)
} catch (error) {
  console.log(error)
}

let url = `https://github.com/johnlindquist/kitapp/releases/download/${tag_name}/${output}`

console.log({ url })
