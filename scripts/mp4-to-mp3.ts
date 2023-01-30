console.log(`Running mp4-to-mp3.ts`)

import "@johnlindquist/kit"

console.log(`After import...`)

console.log(`KENV: ${process.env.KENV}`)

// get the most recently added file in the current directory that is not a directory
let { stdout: files } = await $`git show HEAD --name-only --pretty="" | grep ".mp4$"`

// convert files into an array
let filesArray = files.split(`\n`).filter(Boolean)

let tag_name = `mp3s`

declare const github: any
declare const octokit: any

// Check to see if the release already exists
let releaseResponse = await octokit.rest.repos.getReleaseByTag({
  ...github.context.repo,
  tag: tag_name,
})

// If the release doesn't exist, create it
if (!releaseResponse?.data?.id) {
  releaseResponse = await octokit.rest.repos.createRelease({
    ...github.context.repo,
    tag_name,
    name: tag_name,
  })
}

for await (let file of filesArray) {
  let { name } = path.parse(file)
  let output = `${name}.mp3`

  console.log(`Converting ${file} to ${output}`)

  // convert the file to mp3
  await $`ffmpeg -i ${file} ${output}`

  console.log(`After ffmpeg...`)

  let octokit = github.getOctokit(await env("GITHUB_TOKEN"))

  console.log(`After octokit...`)

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
}
