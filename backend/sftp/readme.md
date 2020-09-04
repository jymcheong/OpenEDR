Instead of having install/1_SFTP.sh programmatically creating directory structure, we defined it once in the repo.

We also shift Github sftp container project here & build image once to push into DockerHub registry.

After which, we will only docker compose instead of a build then docker run since there are many parameters that needs to be organised properly with a compose configuration.