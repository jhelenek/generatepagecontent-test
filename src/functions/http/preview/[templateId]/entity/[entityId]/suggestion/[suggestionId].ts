import { SitesHttpRequest, SitesHttpResponse } from "@yext/pages/*";
import fetch from 'node-fetch';

console.log("In suggestion.ts");

const API_DOMAIN = 'https://qa-api.yextapis.com';
// API key for an app with SitesAPI read permissions
const API_KEY = '838e42c3c62c49afdb3b3b825e40c415';
const V_PARAM = '20240103';

console.log("Consts initialized");

export default async function generatePreview(
  request: SitesHttpRequest
): Promise<SitesHttpResponse> {
  console.log("Beginning of generatePreview");
  const { pathParams, queryParams, site } = request;

  // Get parameters for SitesAPI calls
  const templateId = pathParams['templateId'];
  const entityId = pathParams['entityId'];
  const suggestionId = pathParams['suggestionId'];
  const siteId = site.siteId;
  const deploymentId = site.deployId;

  console.log("Before retrieving entity documents");
  // Retrieve entity document
  const entityResponse = await fetch(`${API_DOMAIN}/v2/accounts/me/sites/${siteId}/fetchentitydocument?entityId=${entityId}&templateId=${templateId}&deploymentId=${deploymentId}&editIds=${suggestionId}&api_key=${API_KEY}&v=${V_PARAM}`);
  const entityJson = await entityResponse.json();
  const entityData = entityJson.response.document;
  console.log("After retrieving entity documents");
  // Generate page content using fetched document
  console.log("Before generating response");
  const generateResponse = await fetch(`${API_DOMAIN}/v2/accounts/me/sites/${siteId}/generatepagecontent?templateId=${templateId}&deploymentId=${deploymentId}&api_key=${API_KEY}&v=${V_PARAM}`, 
    {method: 'POST', body: JSON.stringify(entityData), headers: {'Content-Type': 'application/json'}});
  const generateJson = await generateResponse.json();
  console.log("After generating response");
  // Fix relativePrefixToRoot for serverless function path.
  const html = generateJson.response.content as string;
  console.log(html);
  const htmlWithCorrectPath = html.replaceAll(/(\.\.\/)+/g, '../../../');

  return {
    body: htmlWithCorrectPath,
    headers: {'Content-Type': 'text/html'},
    statusCode: 200,
  };
}
