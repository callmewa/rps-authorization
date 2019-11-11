# RPS Authorization

## run tests

``` bash
npx jest
```

## security

### decorators

`@Resource("{resourceName}")` class level: indicate the resource the controller class represents  
`@Permission("{permission}")` method level: indicate the specific permission the end point requires for access  
`@ResourceId` parameter level: indicate the parameter used to evaluate the permission against.

### example

```typescript
@Resource("guitar")
@Route("/api/guitars")
export class GuitarController extends Controller {
    @Get("{id}")
    @Permission("view")
    public async getGuitar(@ResourceId id: number): Promise<Guitar> {...}
    ...
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
