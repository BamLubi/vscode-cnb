import fetch from 'node-fetch';
import { BlogPost } from '../models/blog-post';
import { globalManager } from './global-state';
import { PageModel } from '../models/page-model';
import { PostsListState } from '../models/posts-list-state';
import { accountService } from './account.service';

const defaultPageSize = 30;

export class BlogPostService {
    private static _instance = new BlogPostService();

    protected get _baseUrl() {
        return globalManager.config.apiBaseUrl;
    }

    static get instance() {
        return this._instance;
    }

    get postsListState(): PostsListState | undefined {
        return globalManager.storage.get<PostsListState>('postsListState');
    }

    protected constructor() {}

    async fetchPostsList({ pageIndex = 1, pageSize = defaultPageSize }): Promise<PageModel<BlogPost>> {
        const s = new URLSearchParams([
            ['t', '1'],
            ['p', `${pageIndex}`],
            ['s', `${pageSize}`],
        ]);
        const response = await fetch(`${this._baseUrl}/api/posts/list?${s}`, {
            headers: [accountService.buildBearerAuthorizationHeader()],
            method: 'GET',
        });
        if (!response.ok) {
            throw Error(`request failed, ${response.status}, ${await response.text()}`);
        }
        const obj = <PagedBlogPostDto>await response.json();
        return new PageModel(obj.pageIndex, obj.pageSize, obj.postsCount, obj.postList);
    }

    async updatePostsListState(state: PostsListState | undefined | PageModel<BlogPost>) {
        const finalState: PostsListState | undefined =
            state instanceof PageModel
                ? {
                      pageIndex: state.pageIndex,
                      pageSize: state.pageSize,
                      totalItemsCount: state.totalItemsCount,
                      itemsCount: state.items?.length ?? 0,
                      timestamp: new Date(),
                      hasNext: state.hasNext,
                      hasPrevious: state.hasPrevious,
                      pageCount: state.pageCount,
                  }
                : state;
        await globalManager.storage.update('postsListState', finalState);
    }
}

export const blogPostService = BlogPostService.instance;

interface PagedBlogPostDto {
    categoryName: string;
    pageIndex: number;
    pageSize: number;
    postList: [];
    postsCount: number;
}