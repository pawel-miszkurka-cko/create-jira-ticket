import * as core from '@actions/core'
import * as github from '@actions/github'
import {createJiraApiInstance} from './jira-api'

async function run(): Promise<void> {
  const JIRA_HOST = core.getInput('JIRA_HOST', {required: true})
  const JIRA_API_TOKEN = core.getInput('JIRA_API_TOKEN', {required: true})
  const JIRA_BOARD_ID = core.getInput('JIRA_BOARD_ID', {required: true})
  const JIRA_TRANSITION_ID = core.getInput('JIRA_TRANSITION_ID', {
    required: true
  })
  const JIRA_ACTIVE_SPRINT_FIELD = core.getInput('JIRA_ACTIVE_SPRINT_FIELD', {
    required: true
  })

  const JIRA_PROJECT_KEY = core.getInput('JIRA_PROJECT_KEY', {required: true})

  try {
    const {getActiveSprint, createTicket} = createJiraApiInstance(
      JIRA_HOST,
      JIRA_API_TOKEN
    )

    const activeSprint = await getActiveSprint(JIRA_BOARD_ID)

    if (activeSprint === null) {
      core.setFailed(`Failure: no active sprints`)
      return
    }

    core.debug(`Active sprint: ${activeSprint.id}`)

    const createdTicket = await createTicket({
      activeSprintId: activeSprint.id,
      activeSprintField: JIRA_ACTIVE_SPRINT_FIELD,
      transitionId: JIRA_TRANSITION_ID,
      projectKey: JIRA_PROJECT_KEY,
      summary: "Test Ticket",
      description: "testing action"
    })

    core.debug(`Created ticket: ${createdTicket}`)

  } catch (error) {
    core.setFailed(`Failure: ${error.message}`)

    core.debug(error.response?.data)
    core.debug(error.response?.status)
    core.debug(error.response?.headers)
  }
}

run()
