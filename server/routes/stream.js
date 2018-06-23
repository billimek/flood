'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs');

const torrentService = require('../services/torrentService');
const streamableExtensions = require('../../shared/constants/streamableExtensions');

router.get('/stream', (req, res, next) => {
  try {
    const selectedTorrent = torrentService.getTorrent(req.query.hash);
    if (!selectedTorrent) return res.status(404).json({error: 'Torrent not found.'});

    const path = selectedTorrent.directory + '/' + req.query.file;
    const extension = path.split('.').pop();

    if (!fs.existsSync(path)) return res.status(404).json({error: 'File not found.'});
    if (!Object.keys(streamableExtensions).includes(extension)) return res.status(404).json({error: 'Cannot stream file.'});
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1]
        ? parseInt(parts[1], 10)
        : fileSize-1;
      const chunksize = (end-start)+1;
      const file = fs.createReadStream(path, {start, end});
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': streamableExtensions[extension],
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': streamableExtensions[extension],
      };
      res.writeHead(200, head);
      fs.createReadStream(path).pipe(res);
    }

  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;