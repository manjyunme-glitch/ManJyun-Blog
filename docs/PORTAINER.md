# Portainer Deployment

1. Create the host data directory on the NAS:

   ```sh
   mkdir -p /share/DockerData/ManJyun-Blog
   ```

2. In Portainer, create a stack from Git repository:

   ```text
   https://github.com/manjyunme-glitch/ManJyun-Blog
   ```

3. Use `docker-compose.yml` from the repository root.

4. Deploy the stack and open:

   ```text
   http://<NAS-IP>:4482
   ```

5. Visit `/admin` to create the first administrator and scan the TOTP QR code.

## Updating

The admin update page only checks GitHub. To update the running stack, use Portainer's pull/redeploy workflow for the Git stack.

