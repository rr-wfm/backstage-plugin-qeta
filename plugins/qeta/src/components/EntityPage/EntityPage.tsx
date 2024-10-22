import React, { useEffect } from 'react';
import { ContentHeader } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import {
  AskQuestionButton,
  EntitiesGrid,
  EntityFollowButton,
  FollowedEntitiesList,
  PostHighlightList,
  PostsContainer,
  qetaApiRef,
  useTranslation,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import Whatshot from '@material-ui/icons/Whatshot';
import { useApi } from '@backstage/core-plugin-api';
import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';
import { EntityRefLink } from '@backstage/plugin-catalog-react';

export const EntityPage = () => {
  const { entityRef } = useParams();
  const { t } = useTranslation();
  const [resp, setResp] = React.useState<undefined | EntityResponse>();

  const qetaApi = useApi(qetaApiRef);

  useEffect(() => {
    if (!entityRef) {
      setResp(undefined);
      return;
    }

    qetaApi.getEntity(entityRef).then(res => {
      if (res) {
        setResp(res);
      }
    });
  }, [qetaApi, entityRef]);

  let shownTitle: string = t('entitiesPage.defaultTitle');
  let link = undefined;
  if (entityRef) {
    shownTitle = t(`postsContainer.title.about`, { itemType: 'Post' });
    link = <EntityRefLink entityRef={entityRef} />;
  }

  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader
          titleComponent={
            <Typography variant="h5" component="h2">
              {shownTitle} {link}
            </Typography>
          }
        >
          {entityRef && <EntityFollowButton entityRef={entityRef} />}
          <AskQuestionButton entity={entityRef} />
          <WriteArticleButton entity={entityRef} />
        </ContentHeader>
        {resp && (
          <Card variant="outlined" style={{ marginBottom: '1rem' }}>
            <CardContent>
              <Typography variant="caption">
                {t('common.posts', {
                  count: resp.postsCount,
                  itemType: 'post',
                })}
                {' · '}
                {t('common.followers', { count: resp.followerCount })}
              </Typography>
            </CardContent>
          </Card>
        )}
        {entityRef ? <PostsContainer entity={entityRef} /> : <EntitiesGrid />}
      </Grid>
      <Grid item lg={3} xl={2}>
        <FollowedEntitiesList />
        <PostHighlightList
          type="hot"
          title={t('highlights.hotQuestions.title')}
          noQuestionsLabel={t('highlights.hotQuestions.noQuestionsLabel')}
          icon={<Whatshot fontSize="small" />}
          options={{ entity: entityRef }}
          postType="question"
        />
        <PostHighlightList
          type="unanswered"
          title={t('highlights.unanswered.title')}
          noQuestionsLabel={t('highlights.unanswered.noQuestionsLabel')}
          options={{ entity: entityRef }}
          postType="question"
        />
        <PostHighlightList
          type="incorrect"
          title={t('highlights.incorrect.title')}
          noQuestionsLabel={t('highlights.incorrect.noQuestionsLabel')}
          options={{ entity: entityRef }}
          postType="question"
        />
      </Grid>
    </Grid>
  );
};