import { SitesHttpRequest, SitesHttpResponse } from "@yext/pages/*";
import fetch from 'node-fetch';

const API_DOMAIN = 'dev.yext.com';
// API key for an app with SitesAPI read permissions
const API_KEY = '45a57ddfe984988b7f78680642654b2c';
const V_PARAM = '20240103';

export default async function generatePreview(
  request: SitesHttpRequest
): Promise<SitesHttpResponse> {
  const { pathParams, queryParams, site } = request;

  // Get parameters for SitesAPI calls
  const templateId = pathParams['templateId'];
  const entityId = pathParams['entityId'];
  const siteId = site.siteId;
  const deploymentId = site.deployId;

  // Retrieve entity document
  const entityResponse = await fetch(`${API_DOMAIN}/v2/accounts/me/sites/${siteId}/fetchentitydocument?entityId=${entityId}&templateId=${templateId}&deploymentId=${deploymentId}&api_key=${API_KEY}&v=${V_PARAM}`);
  const entityJson = await entityResponse.json();
  const entityData = entityJson.response.document;

  // Generate page content using fetched document
  const generateResponse = await fetch(`${API_DOMAIN}/v2/accounts/me/sites/${siteId}/generatepagecontent?templateId=${templateId}&deploymentId=${deploymentId}&api_key=${API_KEY}&v=${V_PARAM}`, 
    {method: 'POST', body: JSON.stringify(entityData), headers: {'Content-Type': 'application/json'}});
  const generateJson = await generateResponse.json();

  // Fix relativePrefixToRoot for serverless function path.
  const html = generateJson.response.content as string;
  const htmlWithCorrectPath = html.replaceAll(/(\.\.\/)+/g, '../../../');

  return {
    body: htmlWithCorrectPath,
    headers: {'Content-Type': 'text/html'},
    statusCode: 200,
  };
}
