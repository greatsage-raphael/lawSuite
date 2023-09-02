import { Writable } from "stream"
import type { NextApiRequest } from "next"
import formidable from "formidable"

export const formidablePromise = (
  req: NextApiRequest,
  opts?: Parameters<typeof formidable>[0]
): Promise<{ files: formidable.Files }> => {
  return new Promise((accept, reject) => {
    const form = formidable(opts)

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      return accept({ files })
    })
  })
}

export const fileConsumer = (
  file: formidable.File,
  endBuffers: {
    [filename: string]: Buffer
  }
) => {
  const chunks: Array<any> = []

  const writable = new Writable({
    write: (chunk, _enc, next) => {
      chunks.push(chunk)
      next()
    },
    destroy() {
      endBuffers = {}
    },
    final(cb) {
      const buffer = Buffer.concat(chunks)
      endBuffers[file.newFilename] = buffer
      cb()
    },
  })

  return writable
}
