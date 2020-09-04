This is equivalent to the old C2 folder but instead of using bindfs to mount as read-only, we using docker -volume to achieve the same outcome.

startResponse.js & frontend.js will have r/w access to this folder.